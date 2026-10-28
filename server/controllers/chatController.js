const { User, UserProfile } = require("../models");
const getStream = require("../helpers/stream");

// The name and photo Stream shows in the chat, always taken from our own database
const toChatUser = (user) => {
    return {
        id: String(user.id),
        name: user.fullName,
        image: user.UserProfile?.profilePicture,
    };
};

class ChatController {
    // The Stream secret can't be in the app, so the server makes the chat token for the logged in user
    static async getToken(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id, { include: UserProfile });
            const token = getStream().createToken(String(user.id));
            res.json({ apiKey: process.env.STREAM_API_KEY, token, user: toChatUser(user) });
        } catch (error) {
            next(error);
        }
    }

    // Stream needs both people to exist before a chat between them can start,
    // but the other person may never have opened the chat yet
    static async addChatUser(req, res, next) {
        try {
            const user = await User.findByPk(req.params.id, { include: UserProfile });
            if (!user) {
                throw { name: "not_found" };
            }
            await getStream().upsertUser(toChatUser(user));
            res.json({ message: "Chat user ready" });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ChatController;