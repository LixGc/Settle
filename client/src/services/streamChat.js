import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StreamChat } from "stream-chat";
import { baseUrl } from "../../store/actions/baseUrl";

let client = null;
let connecting = null;

const connect = async () => {
    // The server makes the chat token, because the Stream secret can't be in the app
    const access_token = await AsyncStorage.getItem("access_token");
    const { data } = await axios({
        url: baseUrl + "/chat/token",
        method: "GET",
        headers: {
            access_token,
        },
    });

    if (!client) {
        client = StreamChat.getInstance(data.apiKey);
    }
    if (client.userID !== data.user.id) {
        // someone else was logged in on this phone before
        if (client.userID) {
            await client.disconnectUser();
        }
        await client.connectUser(data.user, data.token);
    }
    return client;
};

// Every chat screen calls this when it opens. It reuses the connection,
// and two screens opening at the same time share one connection
export const connectChat = () => {
    if (!connecting) {
        connecting = connect().finally(() => {
            connecting = null;
        });
    }
    return connecting;
};

// Opens the chat between the logged in user and someone else, and starts it the first time
export const openChannel = async (client, otherId) => {
    const access_token = await AsyncStorage.getItem("access_token");
    await axios({
        url: baseUrl + "/chat/users/" + otherId,
        method: "POST",
        headers: {
            access_token,
        },
    });

    // The same two people always get the same chat, whoever starts it
    const channel = client.channel("messaging", {
        members: [client.userID, String(otherId)],
    });
    await channel.watch();
    return channel;
};