const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// No real Stream account while testing, it makes a fake token and remembers who was added
const mockAddedUsers = [];
jest.mock("../helpers/stream", () => () => ({
    createToken: (userId) => "chat-token-" + userId,
    upsertUser: async (user) => {
        mockAddedUsers.push(user);
    },
}));

let access_token;

beforeAll(async () => {
    const dataUsers = require("./data/users.json");
    dataUsers.forEach((el) => {
        el.password = hashPassword(el.password);
        el.createdAt = el.updatedAt = new Date();
    });
    await sequelize.queryInterface.bulkInsert("Users", dataUsers);

    const user = await User.findOne({ where: { email: "sam@mail.com" } });
    access_token = signToken({ id: user.id });
});

afterAll(async () => {
    await sequelize.queryInterface.bulkDelete("Users", null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
    });
});

describe("GET chat token /chat/token", () => {
    it("should respond with 200, the token and the chat user", async function () {
        const response = await request(app).get("/chat/token").set("access_token", access_token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token", "chat-token-1");
        expect(response.body.user).toHaveProperty("id", "1");
        expect(response.body.user).toHaveProperty("name", "Sam Owner");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/chat/token");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("POST add the other person to the chat /chat/users/:id", () => {
    it("should respond with 200 and add them with the name from the database", async function () {
        const response = await request(app).post("/chat/users/2").set("access_token", access_token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Chat user ready");
        expect(mockAddedUsers[0]).toHaveProperty("id", "2");
        expect(mockAddedUsers[0]).toHaveProperty("name", "Alex Tenant");
    });

    it("should respond with 404 when the user does not exist", async function () {
        const response = await request(app).post("/chat/users/100").set("access_token", access_token);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).post("/chat/users/2");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});
