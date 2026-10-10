const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { generateOTP, sendOTPByEmail } = require("../helpers/nodemailer");
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
    static async getOTP(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) throw { name: "login_empty_field" };
            const user = await User.findOne({ where: { email } });
            if (!user) throw { name: "email_is_not_registered" };
            const passValid = comparePassword(password, user.password);
            if (!passValid) throw { name: "invalid_password" };
            const otp = generateOTP();

            await user.update({ otp });

            await sendOTPByEmail(user.email, otp);
            res.json({ message: "OTP sent" });
        } catch (error) {
            next(error);
        }
    }

    static async login(req, res, next) {
        try {
            const { email, password, otp } = req.body;
            if (!email || !password) throw { name: "login_empty_field" };
            const user = await User.findOne({ where: { email } });
            if (!user) throw { name: "email_is_not_registered" };
            const passValid = comparePassword(password, user.password);
            if (!passValid) throw { name: "invalid_password" };
            if (!user.otp || user.otp !== otp) throw { name: "invalid_otp" };

            await user.update({ otp: null });

            const access_token = signToken({ id: user.id });
            res.status(200).json({ access_token });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;