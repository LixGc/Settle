import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getUser, fetchReviewByUser, addProfile, editProfile } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { pickImage, toFile } from "../helpers/pickImage";
import { generateStars } from "../helpers/fRating";
import { fDate } from "../helpers/fDate";
import { colors } from "../theme";

function PhotoBox({ label, uri, loading, onPress }) {
    return (
        <Pressable style={{ flex: 1, gap: 6 }} onPress={onPress}>
            <Text style={styles.label}>{label}</Text>
            <View>
                {uri ? (
                    <Image source={{ uri }} style={styles.photo} />
                ) : (
                    <View style={[styles.photo, styles.photoEmpty]}>
                        <Ionicons name="camera-outline" size={26} color={colors.primary} />
                        <Text style={styles.grey}>Choose</Text>
                    </View>
                )}
                {loading && (
                    <View style={styles.photoLoading}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                )}
            </View>
        </Pressable>
    );
}

function Profile() {
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.userReducer);
    const { userReviews } = useSelector((state) => state.reviewReducer);
    const [profilePicture, setProfilePicture] = useState(null);
    const [idCard, setIdCard] = useState(null);
    const [saving, setSaving] = useState(false);
    // Which photo is opening the gallery ("profilePicture" or "idCard"), to show a spinner on it
    const [picking, setPicking] = useState(null);

    useFocusEffect(
        useCallback(() => {
            dispatch(getUser());
            dispatch(fetchReviewByUser());
        }, [])
    );

    // The gallery can take a moment to open, so show a spinner until it does and ignore extra taps
    const choosePhoto = async (name, aspect, setPhoto) => {
        if (picking) return;
        setPicking(name);
        try {
            const uri = await pickImage(aspect);
            if (uri) setPhoto(uri);
        } catch (error) {
            errorAlert("Could not open your photos");
        } finally {
            setPicking(null);
        }
    };

    const chooseProfilePicture = () => choosePhoto("profilePicture", [1, 1], setProfilePicture);
    const chooseIdCard = () => choosePhoto("idCard", [4, 3], setIdCard);
    const submitProfile = () => {
        // The server needs both photos every time
        if (!profilePicture || !idCard) {
            return errorAlert("Please choose a profile photo and an ID card");
        }
        const formData = new FormData();
        formData.append("profilePicture", toFile(profilePicture, "profilePicture"));
        formData.append("idCard", toFile(idCard, "idCard"));

        setSaving(true);
        const action = profile.UserProfile ? editProfile(formData) : addProfile(formData);
        dispatch(action)
            .then((data) => {
                successAlert(data.message);
                setProfilePicture(null);
                setIdCard(null);
            })
            .catch((error) => errorAlert(error))
            .finally(() => setSaving(false));
    };

    if (!profile) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
            {/* details */}
            <View style={styles.card}>
                <Text style={styles.name}>{profile.fullName}</Text>
                <View style={styles.row}>
                    <Ionicons name="mail-outline" size={16} color={colors.grey} />
                    <Text style={styles.grey}>{profile.email}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="call-outline" size={16} color={colors.grey} />
                    <Text style={styles.grey}>{profile.phone}</Text>
                </View>
            </View>

            {/* photo and id */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Photo and ID</Text>
                <Text style={styles.grey}>{profile.UserProfile ? "Choose both photos again to update them" : "Add a photo and your ID so hosts know who is staying"}</Text>
                <View style={styles.photoRow}>
                    <PhotoBox label="Profile photo" uri={profilePicture || profile.UserProfile?.profilePicture} loading={picking === "profilePicture"} onPress={chooseProfilePicture} />
                    <PhotoBox label="ID card" uri={idCard || profile.UserProfile?.idCard} loading={picking === "idCard"} onPress={chooseIdCard} />
                </View>
                {(profilePicture || idCard) && (
                    <Pressable style={styles.button} onPress={submitProfile} disabled={saving}>
                        {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Save</Text>}
                    </Pressable>
                )}
            </View>

            {/* reviews */}
            <View style={{ gap: 10 }}>
                <Text style={styles.sectionTitle}>My reviews</Text>
                {userReviews.length ? (
                    userReviews.map((review) => (
                        <View style={styles.review} key={review.id}>
                            {review.Property && <Image source={{ uri: review.Property.image }} style={styles.reviewImage} />}
                            <View style={{ flex: 1, gap: 3 }}>
                                <Text style={styles.reviewTitle}>{review.Property ? review.Property.name : "Removed property"}</Text>
                                <Text>{generateStars(Math.round(review.rating))}</Text>
                                <Text style={styles.reviewDate}>{fDate(review.createdAt)}</Text>
                                <Text style={styles.reviewMessage}>{review.message}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.grey}>No reviews yet</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        gap: 10,
    },
    name: {
        fontSize: 22,
        fontWeight: "800",
        color: colors.dark,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    grey: {
        fontSize: 13,
        color: colors.grey,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.dark,
    },
    photoRow: {
        flexDirection: "row",
        gap: 12,
    },
    label: {
        fontSize: 12,
        color: colors.grey,
    },
    photo: {
        width: "100%",
        height: 120,
        borderRadius: 12,
        backgroundColor: colors.primaryLight,
    },
    photoEmpty: {
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.primary,
    },
    photoLoading: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        backgroundColor: "rgba(227,241,236,0.95)",
        alignItems: "center",
        justifyContent: "center",
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
    review: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
    },
    reviewImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primaryLight,
    },
    reviewTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.dark,
    },
    reviewDate: {
        fontSize: 11,
        color: colors.grey,
    },
    reviewMessage: {
        marginTop: 4,
        color: colors.dark,
    },
});

export default Profile;