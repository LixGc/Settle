const request = require("supertest");
const app = require("../app");
const { sequelize, User, Booking } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// No real payments while testing. "cs_paid_late" was paid, "cs_down" means Stripe can't be reached
const mockCreate = jest.fn(async () => ({ id: "cs_hold", url: "https://checkout.stripe.com/test" }));
jest.mock("../helpers/stripe", () => () => ({
    checkout: {
        sessions: {
            create: (...args) => mockCreate(...args),
            retrieve: async (sessionId) => {
                if (sessionId === "cs_down") throw new Error("Stripe is down");
                return { payment_status: sessionId === "cs_paid_late" ? "paid" : "unpaid", payment_intent: "pi_late" };
            },
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
let heldId;

const minutesFromNow = (date) => (new Date(date) - Date.now()) / 60000;
const expire = (id, fields = {}) => Booking.update({ expiresAt: new Date(Date.now() - 60000), ...fields }, { where: { id } });

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
    await sequelize.queryInterface.bulkInsert("Users", dataUsers);
    await sequelize.queryInterface.bulkInsert("Categories", dataCategories);
    await sequelize.queryInterface.bulkInsert("Properties", dataProperties);

    // Another guest who wants the same dates
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

describe("An unpaid booking holds its dates", () => {
    it("should hold the dates for 30 minutes after booking", async function () {
        const response = await request(app)
            .post("/bookings/2")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-05-10", endDate: "2027-05-12" });
        expect(response.status).toBe(201);
        heldId = response.body.id;

        const booking = await Booking.findByPk(heldId);
        expect(booking.status).toBe("pending");
        expect(minutesFromNow(booking.expiresAt)).toBeGreaterThan(29);
        expect(minutesFromNow(booking.expiresAt)).toBeLessThan(31);
    });

    it("should stop someone else booking those dates while they're held", async function () {
        const response = await request(app)
            .post("/bookings/2")
            .set("access_token", otherToken)
            .send({ startDate: "2027-05-11", endDate: "2027-05-13" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Property is already booked on those dates");
    });

    it("should give 30 more minutes and remember the Stripe page when paying starts", async function () {
        const response = await request(app).post("/payments/" + heldId).set("access_token", tenantToken);
        expect(response.status).toBe(201);

        // Stripe's page closes a minute after its 30 minute minimum, and the hold ends a minute after that
        const stripeExpiry = mockCreate.mock.calls[0][0].expires_at * 1000;
        expect(minutesFromNow(stripeExpiry)).toBeGreaterThan(30);
        expect(minutesFromNow(stripeExpiry)).toBeLessThan(32);
        const booking = await Booking.findByPk(heldId);
        expect(minutesFromNow(booking.expiresAt)).toBeGreaterThan(minutesFromNow(stripeExpiry));
        expect(booking.paymentSessionId).toBe("cs_hold");
    });
});

describe("When the time runs out", () => {
    it("should cancel the unpaid booking", async function () {
        await expire(heldId);
        const response = await request(app).get("/bookings/" + heldId).set("access_token", tenantToken);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("status", "cancelled");
    });

    it("should leave the cancelled booking out of the booked dates", async function () {
        const response = await request(app).get("/bookings/property/2");
        expect(response.status).toBe(200);
        expect(response.body.map((booking) => booking.id)).not.toContain(heldId);
    });

    it("should show the place in search again for those dates", async function () {
        const response = await request(app).get("/properties?location=Sydney&startdate=2027-05-10&enddate=2027-05-12");
        expect(response.status).toBe(200);
        expect(response.body.map((property) => property.id)).toContain(2);
    });

    it("should let someone else book the dates", async function () {
        const response = await request(app)
            .post("/bookings/2")
            .set("access_token", otherToken)
            .send({ startDate: "2027-05-10", endDate: "2027-05-12" });
        expect(response.status).toBe(201);
    });

    it("should refuse to pay for the cancelled booking", async function () {
        const response = await request(app).post("/payments/" + heldId).set("access_token", tenantToken);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "This booking was cancelled because it wasn't paid within 30 minutes");
    });

    it("should not let the owner mark the cancelled booking as completed", async function () {
        const response = await request(app).patch("/bookings/" + heldId).set("access_token", ownerToken).send({ status: "completed" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "This booking was cancelled because it wasn't paid within 30 minutes");
    });
});

describe("A booking paid at the last moment", () => {
    it("should be marked as paid instead of cancelled, with an invoice", async function () {
        const booked = await request(app)
            .post("/bookings/3")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-06-01", endDate: "2027-06-03" });
        await expire(booked.body.id, { paymentSessionId: "cs_paid_late" });

        const response = await request(app).get("/bookings/" + booked.body.id).set("access_token", tenantToken);
        expect(response.body).toHaveProperty("status", "ongoing");
        expect(sendInvoiceEmail).toHaveBeenCalledTimes(1);
        expect(sendInvoiceEmail.mock.calls[0][1]).toBe("pi_late");
    });

    it("should stay pending when Stripe can't be reached, to check again later", async function () {
        const booked = await request(app)
            .post("/bookings/1")
            .set("access_token", tenantToken)
            .send({ startDate: "2027-07-01", endDate: "2027-07-03" });
        await expire(booked.body.id, { paymentSessionId: "cs_down" });

        const response = await request(app).get("/bookings/" + booked.body.id).set("access_token", tenantToken);
        expect(response.body).toHaveProperty("status", "pending");
    });
});
