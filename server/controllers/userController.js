const { User } = require("../models");

class UserController {
    static async register(req, res, next) {
        try {
            const { fullName, email, password, phone } = req.body;
            await User.create({ fullName, email, password, phone });
            res.status(201).json({ message: "Account successfully created!" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;