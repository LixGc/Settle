import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { connectChat } from "../services/streamChat";
import { getErrorMessage } from "../helpers/alert";
import { colors } from "../theme";

// Chats screen: everyone I've messaged, newest first
function ConversationList({ navigation }) {
    const [client, setClient] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState("");

    // Connect to Stream, load my chats, and keep them updated while this screen is open
    useEffect(() => {
        let chatClient = null;
        let listener = null;
        let cancelled = false;

        // Newest chat on top
        const loadChannels = async () => {
            try {
                const result = await chatClient.queryChannels({ type: "messaging", members: { $in: [chatClient.userID] } }, { last_message_at: -1 });
                // A chat that was opened but never used has no messages, so leave it out
                if (!cancelled) setChannels(result.filter((channel) => channel.state.messages.length > 0));
            } catch (error) {
                if (!cancelled) setErrMsg(getErrorMessage(error));
            }
        };

        const start = async () => {
            try {
                chatClient = await connectChat();
                if (cancelled) return;
                setClient(chatClient);
                await loadChannels();
                // Reload when a message comes in, also from someone starting a new chat
                listener = chatClient.on((event) => {
                    if (event.type === "message.new" || event.type === "notification.message_new") {
                        loadChannels();
                    }
                });
            } catch (error) {
                if (!cancelled) setErrMsg(getErrorMessage(error));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        start();

        // Stop listening when leaving the screen
        return () => {
            cancelled = true;
            listener?.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (errMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.grey}>{errMsg}</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={channels}
            keyExtractor={(item) => item.cid}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
                // The other person in this chat
                const other = Object.values(item.state.members).find((member) => member.user.id !== client.userID)?.user;
                if (!other) return null;
                const lastMessage = item.state.messages[item.state.messages.length - 1];
                return (
                    <Pressable style={styles.row} onPress={() => navigation.navigate("chatbox", { id: other.id, name: other.name })}>
                        {other.image ? (
                            <Image source={{ uri: other.image }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{other.name?.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.name}>{other.name}</Text>
                            {lastMessage && (
                                <Text style={styles.preview} numberOfLines={1}>
                                    {lastMessage.text}
                                </Text>
                            )}
                        </View>
                    </Pressable>
                );
            }}
            ListEmptyComponent={
                <View style={styles.emptyCard}>
                    <Ionicons name="chatbubbles-outline" size={26} color={colors.grey} />
                    <Text style={styles.grey}>No chats yet. Message a host from any place.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    list: {
        padding: 20,
        gap: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.white,
        fontWeight: "800",
        fontSize: 16,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.dark,
    },
    preview: {
        fontSize: 13,
        color: colors.grey,
    },
    grey: {
        fontSize: 13,
        color: colors.grey,
        textAlign: "center",
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 8,
    },
});

export default ConversationList;