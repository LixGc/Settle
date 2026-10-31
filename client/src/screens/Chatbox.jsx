import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { connectChat, openChannel } from "../services/streamChat";
import { errorAlert, getErrorMessage } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

// One chat with one person. id = the other person's user id
function Chatbox({ route }) {
    // property is only passed when a guest starts the chat from a place
    const { id, property } = route.params;
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();
    const [channel, setChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState(property ? `Hi, I'm interested in ${property.name}` : "");
    const [attachedProperty, setAttachedProperty] = useState(property);
    const [errMsg, setErrMsg] = useState("");

    // Open the chat and listen for new messages
    useEffect(() => {
        let chatChannel = null;
        let cancelled = false;
        // Stream has already added the new message to the chat when this runs
        const handleNewMessage = () => {
            setMessages([...chatChannel.state.messages]);
        };

        const start = async () => {
            try {
                const client = await connectChat();
                chatChannel = await openChannel(client, id);
                if (cancelled) return;
                setMessages([...chatChannel.state.messages]);
                chatChannel.on("message.new", handleNewMessage);
                setChannel(chatChannel);
            } catch (error) {
                if (!cancelled) setErrMsg(getErrorMessage(error));
            }
        };
        start();

        // Stop listening when leaving the chat
        return () => {
            cancelled = true;
            chatChannel?.off("message.new", handleNewMessage);
        };
    }, [id]);

    // Sends the text, plus a card of the place if the chat started from a place page
    const sendMessage = () => {
        const value = text.trim();
        if (!value) return;
        const attachments = attachedProperty ? [{ type: "property", title: attachedProperty.name, image_url: attachedProperty.image, price: attachedProperty.price }] : [];
        setText("");
        setAttachedProperty(null);
        channel.sendMessage({ text: value, attachments }).catch((error) => errorAlert(getErrorMessage(error)));
    };

    if (errMsg) {
        return (
            <View style={styles.center}>
                <Text style={styles.grey}>{errMsg}</Text>
            </View>
        );
    }

    if (!channel) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const myId = channel.getClient().userID;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={headerHeight}>
            {/* inverted so the newest message is at the bottom */}
            <FlatList
                data={[...messages].reverse()}
                inverted
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isMe = item.user?.id === myId;
                    const card = item.attachments?.find((attachment) => attachment.type === "property");
                    return (
                        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                            {!isMe &&
                                (item.user?.image ? (
                                    <Image source={{ uri: item.user.image }} style={styles.avatar} />
                                ) : (
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{item.user?.name?.charAt(0)}</Text>
                                    </View>
                                ))}
                            <View style={styles.messageContent}>
                                {/* A place card sent with the first message */}
                                {card && (
                                    <View style={styles.card}>
                                        <Image source={{ uri: card.image_url }} style={styles.cardImage} />
                                        <View style={styles.cardInfo}>
                                            <Text style={styles.cardName} numberOfLines={1}>
                                                {card.title}
                                            </Text>
                                            <Text style={styles.cardPrice}>{fPrice(card.price)} / night</Text>
                                        </View>
                                    </View>
                                )}
                                {!!item.text && (
                                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                                        <Text style={isMe ? styles.textMe : styles.textOther}>{item.text}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    );
                }}
            />

            {/* the place this message is about */}
            {attachedProperty && (
                <View style={styles.attached}>
                    <Image source={{ uri: attachedProperty.image }} style={styles.attachedImage} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName} numberOfLines={1}>
                            {attachedProperty.name}
                        </Text>
                        <Text style={styles.cardPrice}>{fPrice(attachedProperty.price)} / night</Text>
                    </View>
                </View>
            )}

            <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TextInput style={styles.input} placeholder="Type a message" value={text} onChangeText={setText} onSubmitEditing={sendMessage} returnKeyType="send" />
                <Pressable style={styles.sendButton} onPress={sendMessage}>
                    <Ionicons name="send" size={18} color={colors.white} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
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
    grey: {
        color: colors.grey,
        textAlign: "center",
    },
    list: {
        padding: 14,
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        marginVertical: 4,
    },
    messageRowMe: {
        justifyContent: "flex-end",
    },
    messageContent: {
        maxWidth: "75%",
        gap: 6,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.white,
        fontWeight: "800",
        fontSize: 12,
    },
    bubble: {
        borderRadius: 16,
        paddingHorizontal: 14,
        paddingVertical: 9,
    },
    bubbleMe: {
        alignSelf: "flex-end",
        backgroundColor: colors.primary,
    },
    bubbleOther: {
        alignSelf: "flex-start",
        backgroundColor: colors.white,
    },
    textMe: {
        color: colors.white,
    },
    textOther: {
        color: colors.dark,
    },
    card: {
        width: 220,
        backgroundColor: colors.white,
        borderRadius: 14,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: 120,
        backgroundColor: colors.primaryLight,
    },
    cardInfo: {
        padding: 10,
        gap: 2,
    },
    cardName: {
        fontWeight: "700",
        color: colors.dark,
    },
    cardPrice: {
        fontWeight: "700",
        color: colors.primary,
    },
    attached: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: "#E6ECEA",
        paddingHorizontal: 12,
        paddingTop: 10,
    },
    attachedImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingTop: 10,
        backgroundColor: colors.white,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default Chatbox;