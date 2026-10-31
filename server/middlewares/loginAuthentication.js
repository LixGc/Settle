const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

// Runs before every route that needs a login.
// Checks the access_token header, then puts the user on req.user for the controller
async function authentication(req, res, next) {
    try {
        const { access_token } = req.headers;
        if (!access_token) {
            throw { name: "unauthenticated" };
        }
        const data = verifyToken(access_token);
        // The account might have been deleted since the token was made
        const findUser = await User.findByPk(data.id);
        if (!findUser) {
            throw { name: "unauthenticated" };
        }
        req.user = {
            id: findUser.id,
            email: findUser.email,
        };
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authentication;