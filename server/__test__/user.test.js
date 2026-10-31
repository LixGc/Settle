const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// No real emails or uploads while testing, the OTP is always "1234" and every photo gets the same link
jest.mock("../helpers/nodemailer", () => ({
    generateOTP: () => "1234",
    sendOTPByEmail: jest.fn(),
}));
jest.mock("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload_stream: (options, callback) => ({
                end: () => callback(null, { secure_url: "https://res.cloudinary.com/settle/test.jpg" }),
            }),
        },
    },
}));

const image = Buffer.from("test image");
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

describe("POST register new user /register", () => {
    it("should respond with 201 and message", async function () {
        const response = await request(app).post("/register").send({
            fullName: "Jamie Guest",
            email: "jamie@mail.com",
            password: "Password123!",
            phone: "0400000003",
        });
        expect(response.status).toBe(201);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).toHaveProperty("message", "Account successfully created!");
    });

    it("should respond with 400 when name is empty", async function () {
        const response = await request(app).post("/register").send({
            fullName: "",
            email: "new@mail.com",
            password: "Password123!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Name is required!");
    });

    it("should respond with 400 when email is missing", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            password: "Password123!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email is required!");
    });

    it("should respond with 400 when email format is wrong", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "wrong",
            password: "Password123!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Invalid email format!");
    });

    it("should respond with 400 when email is already registered", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "sam@mail.com",
            password: "Password123!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email has already registered");
    });

    it("should respond with 400 when password is missing", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Password is required!");
    });

    it("should respond with 400 when password is too short", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            password: "123",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Minimum password character is 8!");
    });

    it("should respond with 400 when password has no capital letter", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            password: "password123!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Password needs at least 1 capital letter, 1 number and 1 special character!");
    });

    it("should respond with 400 when password has no number", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            password: "Password!!!",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Password needs at least 1 capital letter, 1 number and 1 special character!");
    });

    it("should respond with 400 when password has no special character", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            password: "Password123",
            phone: "0400000004",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Password needs at least 1 capital letter, 1 number and 1 special character!");
    });

    it("should respond with 400 when phone is missing", async function () {
        const response = await request(app).post("/register").send({
            fullName: "New User",
            email: "new@mail.com",
            password: "Password123!",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Phone Number is required!");
    });
});

describe("POST send login code /otp", () => {
    it("should respond with 200 and message", async function () {
        const response = await request(app).post("/otp").send({
            email: "sam@mail.com",
            password: "Password123!",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "OTP sent");
    });

    it("should respond with 401 when email is not registered", async function () {
        const response = await request(app).post("/otp").send({
            email: "wrong@mail.com",
            password: "Password123!",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Email / Password");
    });

    it("should respond with 401 when password is wrong", async function () {
        const response = await request(app).post("/otp").send({
            email: "sam@mail.com",
            password: "wrongpassword",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Email / Password");
    });

    it("should respond with 400 when email is missing", async function () {
        const response = await request(app).post("/otp").send({
            password: "Password123!",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email/Password is required!");
    });
});

describe("POST login with code /login", () => {
    it("should respond with 401 when the code is wrong", async function () {
        const response = await request(app).post("/login").send({
            email: "sam@mail.com",
            password: "Password123!",
            otp: "9999",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid otp code!");
    });

    it("should respond with 401 when password is wrong", async function () {
        const response = await request(app).post("/login").send({
            email: "sam@mail.com",
            password: "wrongpassword",
            otp: "1234",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Email / Password");
    });

    it("should respond with 400 when email is missing", async function () {
        const response = await request(app).post("/login").send({
            password: "Password123!",
            otp: "1234",
        });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Email/Password is required!");
    });

    it("should respond with 200 and access_token", async function () {
        const response = await request(app).post("/login").send({
            email: "sam@mail.com",
            password: "Password123!",
            otp: "1234",
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("access_token", expect.any(String));
    });

    it("should respond with 401 when the code was already used", async function () {
        const response = await request(app).post("/login").send({
            email: "sam@mail.com",
            password: "Password123!",
            otp: "1234",
        });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid otp code!");
    });
});

describe("GET user profile /profiles", () => {
    it("should respond with 200 and the user", async function () {
        const response = await request(app).get("/profiles").set("access_token", access_token);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("fullName", "Sam Owner");
        expect(response.body).toHaveProperty("email", "sam@mail.com");
        expect(response.body).toHaveProperty("totalBookings", 0);
        expect(response.body).toHaveProperty("totalAmount", 0);
        expect(response.body).not.toHaveProperty("password");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/profiles");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });

    it("should respond with 401 with a wrong access_token", async function () {
        const response = await request(app).get("/profiles").set("access_token", "randomstring");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("POST user photo and ID /profiles", () => {
    it("should respond with 400 without ID card", async function () {
        const response = await request(app)
            .post("/profiles")
            .set("access_token", access_token)
            .attach("profilePicture", image, "profile.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "ID card is required!");
    });

    it("should respond with 400 without profile picture", async function () {
        const response = await request(app)
            .post("/profiles")
            .set("access_token", access_token)
            .attach("idCard", image, "id.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Profile Picture is required!");
    });

    it("should respond with 400 when the file is not an image", async function () {
        const response = await request(app)
            .post("/profiles")
            .set("access_token", access_token)
            .attach("profilePicture", image, "notes.txt")
            .attach("idCard", image, "id.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Failed to upload images");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).post("/profiles");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });

    it("should respond with 201 and message", async function () {
        const response = await request(app)
            .post("/profiles")
            .set("access_token", access_token)
            .attach("profilePicture", image, "profile.jpg")
            .attach("idCard", image, "id.jpg");
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Account profile successfully created!");
    });
});

describe("PUT user photo and ID /profiles", () => {
    it("should respond with 200 and message", async function () {
        const response = await request(app)
            .put("/profiles")
            .set("access_token", access_token)
            .attach("profilePicture", image, "profile.jpg")
            .attach("idCard", image, "id.jpg");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Successfully updated!");
    });


    it("should respond with 400 without ID card", async function () {
        const response = await request(app)
            .put("/profiles")
            .set("access_token", access_token)
            .attach("profilePicture", image, "profile.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "ID card is required!");
    });
});

describe("DELETE user account /profiles", () => {
    it("should respond with 401 without access_token", async function () {
        const response = await request(app).delete("/profiles");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });

    it("should respond with 200 and message", async function () {
        const user = await User.findOne({ where: { email: "jamie@mail.com" } });
        const response = await request(app)
            .delete("/profiles")
            .set("access_token", signToken({ id: user.id }));
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Account successfully deleted!");
    });
});
