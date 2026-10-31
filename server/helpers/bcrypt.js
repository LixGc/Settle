const bcrypt = require("bcryptjs");

// Turns a password into a hash, so the real password is never saved
const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

// Checks a typed password against the saved hash
const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };