const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// No real payments while testing, Stripe says "cs_paid" is paid and anything else is not
jest.mock("../helpers/stripe", () => () => ({
    checkout: {
        sessions: {
            create: async () => ({ id: "cs_test", url: "https://checkout.stripe.com/test" }),
            retrieve: async (sessionId) => ({
                payment_status: sessionId === "cs_paid" ? "paid" : "unpaid",
                metadata: { bookingId: "2" },
                payment_intent: "pi_test",
            }),
        },
    },
}));
// No real emails while testing
jest.mock("../helpers/nodemailer", () => ({
    generateOTP: jest.fn(),
    sendOTPByEmail: jest.fn(),
    sendInvoiceEmail: jest.fn(async () => {}),
}));
const { sendInvoiceEmail } = require("../helpers/nodemailer");

let ownerToken;
let tenantToken;
let otherToken;

beforeAll(async () => {
    const dataUsers = require("./data/users.json");
    dataUsers.forEach((el) => {
        el.password = hashPassword(el.password);
        el.createdAt = el.updatedAt = new Date();
    });
    const dataCategories = require("../data/category.json");
    dataCategories.forEach((el) => {
        el.specifications = JSON.stringify(el.specifications);
        el.createdAt = el.updatedAt = new Date();
    });
    const dataProperties = require("./data/property.json");
    dataProperties.forEach((el) => {
        el.createdAt = el.updatedAt = new Date();
    });
    // Alex has booked Sam's studio (id 2) from 1 to 5 December, $90 x 4 nights
    const dataBookings = [
        {
            PropertyId: 2,
            UserId: 2,
            ownerId: 1,
            startDate: new Date("2026-12-01"),
            endDate: new Date("2026-12-05"),
            totalPrice: 360,
            status: "ongoing",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    await sequelize.queryInterface.bulkInsert("Users", dataUsers);
    await sequelize.queryInterface.bulkInsert("Categories", dataCategories);
    await sequelize.queryInterface.bulkInsert("Properties", dataProperties);
    await sequelize.queryInterface.bulkInsert("Bookings", dataBookings);

    // Someone who is not part of any booking
    const other = await User.create({ fullName: "Jamie Guest", email: "jamie@mail.com", password: "Password123!", phone: "0400000003" });
    const owner = await User.findOne({ where: { email: "sam@mail.com" } });
    const tenant = await User.findOne({ where: { email: "alex@mail.com" } });
    ownerToken = signToken({ id: owner.id });
    tenantToken = signToken({ id: tenant.id });
    otherToken = signToken({ id: other.id });
});

afterAll(async () => {
    await sequelize.queryInterface.bulkDelete("Users", null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
    });
    await sequelize.queryInterface.bulkDelete("Categories", null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
    });
});

describe("POST book a property /bookings/:PropertyId", () => {
    it("should respond with 201 and the new booking id", async function () {
        const response = await request(app)
            .post("/bookings/1")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-01-10", endDate: "2027-01-13" });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Success create new booking");
        expect(response.body).toHaveProperty("id", 2);
    });

    it("should respond with 400 when the dates overlap another booking", async function () {
        const response = await request(app)
            .post("/bookings/2")
            .set("access_token", tenantToken)
            .send({ startDate: "2026-12-03", endDate: "2026-12-07" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Property is already booked on those dates");
    });

    it("should respond with 400 when check-out is not after check-in", async function () {
        const response = await request(app)
            .post("/bookings/1")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-02-10", endDate: "2027-02-10" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "End date must be after start date");
    });

    it("should respond with 400 without dates", async function () {
        const response = await request(app).post("/bookings/1").set("access_token", tenantToken).send({ startDate: "" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Start date and end date are required");
    });

    it("should respond with 403 when booking your own property", async function () {
        const response = await request(app)
            .post("/bookings/1")
            .set("access_token", ownerToken)
            .send({ startDate: "2027-03-10", endDate: "2027-03-12" });
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Cannot book your own property");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app)
            .post("/bookings/100")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-03-10", endDate: "2027-03-12" });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).post("/bookings/1").send({ startDate: "2027-03-10", endDate: "2027-03-12" });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("GET my bookings /bookings", () => {
    it("should respond with 200 and the guest's bookings", async function () {
        const response = await request(app).get("/bookings").set("access_token", tenantToken);
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(2);
        expect(response.body[0].Property).not.toHaveProperty("address");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/bookings");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("GET bookings of my properties /bookings/owner", () => {
    it("should respond with 200 and the owner's guest bookings", async function () {
        const response = await request(app).get("/bookings/owner").set("access_token", ownerToken);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].User).toHaveProperty("fullName", "Alex Tenant");
    });
});

describe("GET booking detail /bookings/:id", () => {
    it("should respond with 200 and the price for the nights", async function () {
        const response = await request(app).get("/bookings/2").set("access_token", tenantToken);
        expect(response.status).toBe(200);
        // 3 nights x $45
        expect(response.body).toHaveProperty("totalPrice", 135);
        expect(response.body).toHaveProperty("status", "pending");
        // Not paid yet, so no address
        expect(response.body).not.toHaveProperty("exactLocation");
    });

    it("should respond with 200 and the address for the owner", async function () {
        const response = await request(app).get("/bookings/2").set("access_token", ownerToken);
        expect(response.status).toBe(200);
        expect(response.body.exactLocation).toHaveProperty("address", "10 King Street");
    });

    it("should respond with 403 for someone else", async function () {
        const response = await request(app).get("/bookings/2").set("access_token", otherToken);
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You are not allowed to see this booking");
    });

    it("should respond with 404 when the booking does not exist", async function () {
        const response = await request(app).get("/bookings/100").set("access_token", tenantToken);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("GET booked dates of a property /bookings/property/:propertyId", () => {
    it("should respond with 200 and only the dates", async function () {
        const response = await request(app).get("/bookings/property/2");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty("startDate");
        expect(response.body[0]).not.toHaveProperty("UserId");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app).get("/bookings/property/100");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("POST pay for a booking /payments/:bookingId", () => {
    it("should respond with 201 and the Stripe page", async function () {
        const response = await request(app).post("/payments/2").set("access_token", tenantToken);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("url", expect.any(String));
    });

    it("should respond with 403 when it is not your booking", async function () {
        const response = await request(app).post("/payments/2").set("access_token", ownerToken);
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You can only pay for your own booking");
    });

    it("should respond with 400 when the booking is already paid", async function () {
        const response = await request(app).post("/payments/1").set("access_token", tenantToken);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "This booking has already been paid");
    });

    it("should respond with 404 when the booking does not exist", async function () {
        const response = await request(app).post("/payments/100").set("access_token", tenantToken);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("GET back from Stripe /payments/success", () => {
    it("should respond with 400 when the payment is not finished", async function () {
        const response = await request(app).get("/payments/success?session_id=cs_unpaid");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Payment has not been completed");
    });

    it("should respond with 404 without session_id", async function () {
        const response = await request(app).get("/payments/success");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 200 and set the booking to ongoing", async function () {
        const response = await request(app).get("/payments/success?session_id=cs_paid");
        expect(response.status).toBe(200);

        const booking = await request(app).get("/bookings/2").set("access_token", tenantToken);
        expect(booking.body).toHaveProperty("status", "ongoing");
        // Paid, so the guest now gets the address
        expect(booking.body.exactLocation).toHaveProperty("address", "10 King Street");
    });

    it("should email the guest one invoice", async function () {
        expect(sendInvoiceEmail).toHaveBeenCalledTimes(1);
        const [invoiceBooking, paymentId] = sendInvoiceEmail.mock.calls[0];
        expect(invoiceBooking.User).toHaveProperty("email", "alex@mail.com");
        expect(invoiceBooking.Property).toHaveProperty("name", "Cosy room near campus");
        expect(paymentId).toBe("pi_test");
    });

    it("should not send a second invoice when the payment is reported again", async function () {
        const response = await request(app).get("/payments/success?session_id=cs_paid");
        expect(response.status).toBe(200);
        expect(sendInvoiceEmail).toHaveBeenCalledTimes(1);
    });

    it("should respond with 200 on the cancel page", async function () {
        const response = await request(app).get("/payments/cancel");
        expect(response.status).toBe(200);
    });
});

describe("PATCH booking status /bookings/:id", () => {
    it("should respond with 403 when the guest tries to change it", async function () {
        const response = await request(app).patch("/bookings/1").set("access_token", tenantToken).send({ status: "completed" });
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "Only the owner can update this booking");
    });

    it("should respond with 400 with an unknown status", async function () {
        const response = await request(app).patch("/bookings/1").set("access_token", ownerToken).send({ status: "cancelled" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid booking status");
    });

    it("should respond with 404 when the booking does not exist", async function () {
        const response = await request(app).patch("/bookings/100").set("access_token", ownerToken).send({ status: "completed" });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 200 and add the total to the owner's balance", async function () {
        const response = await request(app).patch("/bookings/1").set("access_token", ownerToken).send({ status: "completed" });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Booking status updated to completed");

        const profile = await request(app).get("/profiles").set("access_token", ownerToken);
        expect(profile.body).toHaveProperty("totalAmount", 360);
    });
});

describe("GET most booked properties /trending", () => {
    it("should respond with 200 and the properties with completed stays", async function () {
        const response = await request(app).get("/trending");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty("name", "City studio with balcony");
    });
});
