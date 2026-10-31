const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Database settings. npm run dev uses development, Jest uses test
module.exports = {
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "settle_dev",
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false,
    },
    test: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_TEST || "settle_test",
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT) || 5432,
        dialect: "postgres",
        logging: false,
    },
    production: {
        // When it's hosted online, the whole database address comes in DATABASE_URL
        use_env_variable: "DATABASE_URL",
        dialect: "postgres",
        logging: false,
    },
};