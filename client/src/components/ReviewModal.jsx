import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, TextInput, Modal, ActivityIndicator } from "react-native";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { addReview } from "../../store/actions";
import { successAlert } from "../helpers/alert";
import { colors } from "../theme";

// Text under the stars for each rating, 0 = nothing picked yet
const ratingText = ["How was your stay?", "Very bad", "Bad", "Average", "Good", "Very good"];

// Popup to rate a place after a stay. onSuccess lets the screen move on once it's posted
function ReviewModal({ visible, property, onClose, onSuccess }) {
    const dispatch = useDispatch();
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const close = () => {
        setRating(0);
        setMessage("");
        setErrMsg("");
        onClose();
    };

    const postReview = () => {
        // A toast would be hidden behind the modal, so errors show inside it
        if (!rating || !message) {
            return setErrMsg("Please choose a rating and write a few words");
        }
        setSubmitting(true);
        dispatch(addReview({ rating, message }, property.id))
            .then((data) => {
                close();
                successAlert(data.message);
                onSuccess();
            })
            .catch((error) => setErrMsg(error))
            .finally(() => setSubmitting(false));
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
            <View style={styles.backdrop}>
                <View style={styles.container}>
                    <Pressable style={styles.closeButton} onPress={close}>
                        <MaterialIcons name="close" size={26} color={colors.grey} />
                    </Pressable>
                    <View style={styles.header}>
                        <Image source={{ uri: property.image }} style={styles.image} />
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={styles.name} numberOfLines={1}>
                                {property.name}
                            </Text>
                            <Text style={styles.grey}>{ratingText[rating]}</Text>
                            <View style={styles.stars}>
                                {/* Tap a star to pick the rating, every star up to it lights up */}
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable key={star} onPress={() => setRating(star)}>
                                        <AntDesign name="star" size={26} color={star <= rating ? colors.accent : "#DDE5E2"} />
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                    <TextInput style={styles.input} placeholder="Tell other guests about the place" multiline value={message} onChangeText={setMessage} />
                    {errMsg ? <Text style={styles.errorText}>{errMsg}</Text> : null}
                    <Pressable style={styles.button} onPress={postReview} disabled={submitting}>
                        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Submit</Text>}
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        paddingTop: 40,
        gap: 14,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    image: {
        width: 72,
        height: 72,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.dark,
    },
    grey: {
        fontSize: 13,
        color: colors.grey,
    },
    stars: {
        flexDirection: "row",
        gap: 4,
    },
    input: {
        height: 100,
        textAlignVertical: "top",
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "#DDE5E2",
    },
    errorText: {
        color: colors.danger,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
        alignItems: "center",
    },
    buttonText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});

export default ReviewModal;