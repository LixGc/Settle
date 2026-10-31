const jwt = require("jsonwebtoken");

// The secret that signs login tokens, nothing works without it
const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set. Add it to server/.env");
    }
    return secret;
};

// Makes a login token that lasts 7 days
const signToken = (data) => {
    return jwt.sign(data, getSecret(), { expiresIn: "7d" });
};

// Reads a token back, throws an error if it's fake or expired
const verifyToken = (token) => {
    return jwt.verify(token, getSecret());
};

module.exports = { signToken, verifyToken };