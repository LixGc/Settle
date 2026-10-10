const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { generateOTP, sendOTPByEmail } = require("../helpers/nodemailer");
const { User, UserProfile, Booking, Property, Balance } = require("../models");

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
    static async getProfile(req, res, next) {
        try {
            const data = await User.findOne({
                where: { id: req.user.id },
                attributes: { exclude: ["password", "otp"] },
                include: [
                    {
                        model: UserProfile,
                    },
                    {
                        model: Balance,
                    },
                    {
                        model: Booking,
                        include: Property,
                    },
                ],
            });

            data.dataValues.totalBookings = data.Bookings.length;
            data.dataValues.totalAmount = data.Balances.reduce((sum, balance) => sum + balance.amount, 0);
            data.dataValues.Balances = undefined;

            res.json(data);
        } catch (error) {
            next(error);
        }
    }
    static async createProfile(req, res, next) {
        try {
            if (!req.profilePicture) throw { name: "Profile Picture is required!" };
            if (!req.idCard) throw { name: "ID card is required!" };
            await UserProfile.create({
                profilePicture: req.profilePicture,
                idCard: req.idCard,
                UserId: req.user.id,
            });
            res.status(201).json({ message: "Account profile successfully created!" });
        } catch (error) {
            next(error);
        }
    }

    static async editProfile(req, res, next) {
        try {
            const { idCard, profilePicture } = req;
            if (!profilePicture) throw { name: "Profile Picture is required!" };
            if (!idCard) throw { name: "ID card is required!" };
            await UserProfile.update({ idCard, profilePicture }, { where: { UserId: req.user.id } });
            res.json({ message: "Successfully updated!" });
        } catch (error) {
            next(error);
        }
    }

    static async deleteUser(req, res, next) {
        try {
            await User.destroy({ where: { id: req.user.id } });
            res.json({ message: "Account successfully deleted!" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;