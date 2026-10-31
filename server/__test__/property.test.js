const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models/index");
const { hashPassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

// No real uploads while testing, every photo gets the same link
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
// No real map lookups while testing, every address is found at the same spot
jest.mock("../helpers/geocode", () => async () => ({ latitude: -33.8961, longitude: 151.1802 }));

const image = Buffer.from("test image");
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
    const dataSuburbs = require("./data/suburb.json");
    dataSuburbs.forEach((el) => {
        el.createdAt = el.updatedAt = new Date();
    });
    // The studio (id 2) is booked from 1 to 5 December
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
    await sequelize.queryInterface.bulkInsert("Suburbs", dataSuburbs);

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
    await sequelize.queryInterface.bulkDelete("Suburbs", null, {
        truncate: true,
        restartIdentity: true,
    });
});

describe("GET suburbs for the listing form /suburbs", () => {
    it("should respond with 200 and the suburbs starting with what was typed", async function () {
        const response = await request(app).get("/suburbs?search=par");
        expect(response.status).toBe(200);
        expect(response.body.map((suburb) => suburb.name)).toEqual(["Parramatta"]);
    });

    it("should respond with 200 and nothing for a single letter", async function () {
        const response = await request(app).get("/suburbs?search=p");
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });
});

describe("GET properties /properties", () => {
    it("should respond with 200 and all properties", async function () {
        const response = await request(app).get("/properties");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(3);
        expect(response.body[0]).toHaveProperty("name", expect.any(String));
        expect(response.body[0]).toHaveProperty("location", expect.any(String));
        expect(response.body[0]).toHaveProperty("averageRating", expect.any(String));
        expect(response.body[0]).toHaveProperty("totalBookings", expect.any(Number));
    });

    it("should respond with 200 and only properties in that suburb", async function () {
        const response = await request(app).get("/properties?location=Parramatta");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty("location", "Parramatta");
    });

    it("should leave out properties that are booked on those dates", async function () {
        const response = await request(app).get("/properties?location=Sydney&startdate=2026-12-02&enddate=2026-12-04");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toHaveProperty("name", "Cosy room near campus");
    });

    it("should respond with 404 when no property is in that suburb", async function () {
        const response = await request(app).get("/properties?location=Perth");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("GET suburbs /properties/locations", () => {
    it("should respond with 200 and each suburb once, with its details", async function () {
        const response = await request(app).get("/properties/locations");
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        // Sydney has the most places, so it comes first. Its booked studio is the favourite
        expect(response.body[0]).toMatchObject({ name: "Sydney", totalPlaces: 2, lowestPrice: 45, favourite: "City studio with balcony", kmToCity: 0 });
        expect(response.body[1]).toMatchObject({ name: "Parramatta", totalPlaces: 1, lowestPrice: 220, totalReviews: 0, favourite: null, kmToCity: 20 });
    });
});

describe("GET categories /categories", () => {
    it("should respond with 200 and all categories", async function () {
        const response = await request(app).get("/categories");
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBe(5);
    });
});

describe("GET property detail /properties/:id", () => {
    it("should respond with 200 and the property with its rating", async function () {
        const response = await request(app).get("/properties/1");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("property", expect.any(Object));
        expect(response.body.property).toHaveProperty("name", "Cosy room near campus");
        expect(response.body).toHaveProperty("rating");
        expect(response.body.property).not.toHaveProperty("address");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app).get("/properties/100");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("GET my properties /properties/my-properties", () => {
    it("should respond with 200 and the owner's properties", async function () {
        const response = await request(app).get("/properties/my-properties").set("access_token", ownerToken);
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3);
        // Owners can see their own addresses
        expect(response.body.find((property) => property.name === "Cosy room near campus")).toHaveProperty("address", "10 King Street");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).get("/properties/my-properties");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("POST add property /properties", () => {
    it("should respond with 201 and message", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "Bright apartment by the park")
            .field("CategoryId", "3")
            .field("price", "150")
            .field("location", "Chatswood")
            .field("address", "1 Archer Street")
            .field("description", "Two bedrooms and a sunny balcony, five minutes from the station.")
            .field("amenities", JSON.stringify(["wifi", "balcony"]))
            .field("specifications", JSON.stringify([{ name: "bedrooms", value: "2" }]))
            .attach("image", image, "main.jpg")
            .attach("images", image, "extra1.jpg")
            .attach("images", image, "extra2.jpg");
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "Success Add New Property");
    });

    it("should save the details and the extra photos", async function () {
        const response = await request(app).get("/properties/4");
        expect(response.status).toBe(200);
        expect(response.body.property.Specifications.length).toBe(1);
        expect(response.body.property.PropertyImages.length).toBe(2);
        expect(response.body.property).toHaveProperty("location", "Chatswood");
        expect(response.body.property).toHaveProperty("description", "Two bedrooms and a sunny balcony, five minutes from the station.");
        expect(response.body.property).toHaveProperty("amenities", ["wifi", "balcony"]);
        // Anyone can open a place, so it only shows the rough area and no address
        expect(response.body.property).toHaveProperty("latitude", -33.9);
        expect(response.body.property).toHaveProperty("longitude", 151.18);
        expect(response.body.property).not.toHaveProperty("address");
    });

    it("should respond with 400 when name is empty", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "")
            .field("CategoryId", "3")
            .field("price", "150")
            .field("location", "Chatswood")
            .attach("image", image, "main.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Name is required!");
    });

    it("should respond with 400 when the suburb isn't from the list", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "Bright apartment by the park")
            .field("CategoryId", "3")
            .field("price", "150")
            .field("location", "Atlantis")
            .field("address", "1 Archer Street")
            .attach("image", image, "main.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Please choose a suburb from the list");
    });

    it("should respond with 400 when the description is too long", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "Bright apartment by the park")
            .field("CategoryId", "3")
            .field("price", "150")
            .field("location", "Chatswood")
            .field("description", "a".repeat(1001))
            .attach("image", image, "main.jpg");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Description can't be longer than 1000 characters");
    });

    it("should respond with 400 without a main photo", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "Bright apartment by the park")
            .field("CategoryId", "3")
            .field("price", "150")
            .field("location", "Chatswood");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Image is required!");
    });

    it("should respond with 400 when the file is not an image", async function () {
        const response = await request(app)
            .post("/properties")
            .set("access_token", ownerToken)
            .field("name", "Bright apartment by the park")
            .attach("image", image, "notes.txt");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("message", "Failed to upload images");
    });

    it("should respond with 401 without access_token", async function () {
        const response = await request(app).post("/properties");
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message", "Invalid Token");
    });
});

describe("PUT edit property /properties/:id", () => {
    it("should respond with 200 and message", async function () {
        const response = await request(app)
            .put("/properties/1")
            .set("access_token", ownerToken)
            .field("name", "Cosy room near campus")
            .field("CategoryId", "1")
            .field("price", "50")
            .field("location", "Sydney");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Success Edit Property");
    });

    it("should change the description and amenities", async function () {
        await request(app)
            .put("/properties/1")
            .set("access_token", ownerToken)
            .field("name", "Cosy room near campus")
            .field("price", "50")
            .field("location", "Sydney")
            .field("description", "A quiet room with a desk.")
            .field("amenities", JSON.stringify(["wifi", "workspace"]));
        const response = await request(app).get("/properties/1");
        expect(response.body.property).toHaveProperty("description", "A quiet room with a desk.");
        expect(response.body.property).toHaveProperty("amenities", ["wifi", "workspace"]);
    });

    it("should keep the amenities when the app doesn't send them", async function () {
        await request(app).put("/properties/1").set("access_token", ownerToken).field("name", "Cosy room near campus").field("price", "50").field("location", "Sydney");
        const response = await request(app).get("/properties/1");
        expect(response.body.property).toHaveProperty("amenities", ["wifi", "workspace"]);
    });

    it("should respond with 403 when it is not the owner", async function () {
        const response = await request(app)
            .put("/properties/1")
            .set("access_token", tenantToken)
            .field("name", "Not my room")
            .field("price", "10")
            .field("location", "Sydney");
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You are not the owner of this property");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app)
            .put("/properties/100")
            .set("access_token", ownerToken)
            .field("name", "Cosy room near campus")
            .field("price", "50")
            .field("location", "Sydney");
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });
});

describe("DELETE property /properties/:id", () => {
    it("should respond with 403 when it is not the owner", async function () {
        const response = await request(app).delete("/properties/3").set("access_token", tenantToken);
        expect(response.status).toBe(403);
        expect(response.body).toHaveProperty("message", "You are not the owner of this property");
    });

    it("should respond with 404 when the property does not exist", async function () {
        const response = await request(app).delete("/properties/100").set("access_token", ownerToken);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Not Found");
    });

    it("should respond with 200 and message", async function () {
        const response = await request(app).delete("/properties/3").set("access_token", ownerToken);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Success Delete Property With Id 3");
    });
});
