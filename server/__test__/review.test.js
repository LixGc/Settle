const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

let ownerToken;
let tenantToken;

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
    // Alex finished a stay at the room (id 1) but has only booked the studio (id 2)
    const dataBookings = [
        {
            PropertyId: 1,
            UserId: 2,
            ownerId: 1,
            startDate: new Date("2026-11-01"),
            endDate: new Date("2026-11-03"),
            totalPrice: 90,
            status: "completed",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            PropertyId: 2,
            UserId: 2,
            ownerId: 1,
            startDate: new Date("2026-12-01"),
            endDate: new Date("2026-12-05"),
            totalPrice: 360,
            status: "pending",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    await sequelize.queryInterface.bulkInsert("Users", dataUsers);
    await sequelize.queryInterface.bulkInsert("Categories", dataCategories);
    await sequelize.queryInterface.bulkInsert("Properties", dataProperties);
    await sequelize.queryInterface.bulkInsert("Bookings", dataBookings);

    const owner = await User.findOne({ where: { email: "sam@mail.com" } });
    const tenant = await User.findOne({ where: { email: "alex@mail.com" } });
    ownerToken = signToken({ id: owner.id });
    tenantToken = signToken({ id: tenant.id });
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

describe("POST review a property /reviews/:PropertyId", () => {
    it("should respond with 201 and message", async function () {
        const response = await request(app).post("/reviews/1").set("access_token", tenantToken).send({
            rating: 5,
            message: "Clean room and a friendly host",
        });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Review success!");
    });

    it("should respond with 403 without a completed stay", async function () {
        const response = await request(app).post("/reviews/2").set("access_token", tenantToken).send({
            rating: 5,
            message: "Looks nice",
        });
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You can only review a property after completing a booking");
    });

    it("should respond with 400 without a message", async function () {
        const response = await request(app).post("/reviews/1").set("access_token", tenantToken).send({
            rating: 4,
            message: "",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Message is required!");
    });

    it("should respond with 400 without a rating", async function () {
        const response = await request(app).post("/reviews/1").set("access_token", tenantToken).send({
            message: "Great stay",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Rating is required!");
    });

    it("should respond with 400 when the rating is over 5", async function () {
        const response = await request(app).post("/reviews/1").set("access_token", tenantToken).send({
            rating: 6,
            message: "Great stay",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Maximal Rating is 5!");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app).post("/reviews/100").set("access_token", tenantToken).send({
            rating: 5,
            message: "Great stay",
        });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).post("/reviews/1").send({
            rating: 5,
            message: "Great stay",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("GET reviews of a property /reviews/:PropertyId", () => {
    it("should respond with 200 and the reviews with who wrote them", async function () {
        const response = await request(app).get("/reviews/1");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].User).toHaveProperty("fullName", "Alex Tenant");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app).get("/reviews/100");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should show the new rating on the property", async function () {
        const response = await request(app).get("/properties/1");
        expect(response.body).toHaveProperty("rating", "5.0");
    });
});

describe("GET reviews of my places /reviews/my-properties", () => {
    it("should respond with 200 and the reviews on the owner's places", async function () {
        const response = await request(app).get("/reviews/my-properties").set("access_token", ownerToken);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].Property).toHaveProperty("name", "Cosy room near campus");
        expect(response.body[0].User).toHaveProperty("fullName", "Alex Tenant");
    });

    it("should respond with 200 and no reviews for someone without places", async function () {
        const response = await request(app).get("/reviews/my-properties").set("access_token", tenantToken);
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/reviews/my-properties");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("GET my reviews /reviews", () => {
    it("should respond with 200 and the user's reviews", async function () {
        const response = await request(app).get("/reviews").set("access_token", tenantToken);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].Property).toHaveProperty("name", "Cosy room near campus");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/reviews");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});
