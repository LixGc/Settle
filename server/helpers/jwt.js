const jwt = require("jsonwebtoken");

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not set. Add it to server/.env");
    }
    return secret;
};

const signToken = (data) => {
    return jwt.sign(data, getSecret(), { expiresIn: "7d" });
};

const verifyToken = (token) => {
    return jwt.verify(token, getSecret());
};

module.exports = { signToken, verifyToken };