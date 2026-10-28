const { StreamChat } = require("stream-chat");

const getStream = () => {
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
        throw new Error("STREAM_API_KEY and STREAM_API_SECRET are not set. Add them to server/.env");
    }
    return StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
};

module.exports = getStream;