import React, { useCallback } from "react";
import { View, Text, StyleSheet, Image, FlatList, Pressable } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviewsOfMyProperties } from "../../store/actions";
import { generateStars } from "../helpers/fRating";
import { fDate } from "../helpers/fDate";
import { colors } from "../theme";

function PlaceReviews({ navigation }) {
    const dispatch = useDispatch();
    const { ownerReviews } = useSelector((state) => state.reviewReducer);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchReviewsOfMyProperties());
        }, [])
    );

    // Average of every review across the owner's places
    const average = ownerReviews.length ? ownerReviews.reduce((sum, review) => sum + review.rating, 0) / ownerReviews.length : 0;

    return (
        <FlatList
            style={styles.container}
            data={ownerReviews}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                ownerReviews.length ? (
                    <View style={styles.summary}>
                        <AntDesign name="star" size={28} color={colors.accent} />
                        <View>
                            <Text style={styles.average}>{average.toFixed(1)}</Text>
                            <Text style={styles.grey}>
                                from {ownerReviews.length} {ownerReviews.length === 1 ? "review" : "reviews"} across your places
                            </Text>
                        </View>
                    </View>
                ) : null
            }
            renderItem={({ item }) => (
                <Pressable style={styles.card} onPress={() => navigation.navigate("detail", { id: item.Property.id, name: item.Property.name })}>
                    <View style={styles.placeRow}>
                        <Image source={{ uri: item.Property.image }} style={styles.placeImage} />
                        <Text style={styles.placeName} numberOfLines={1}>
                            {item.Property.name}
                        </Text>
                    </View>
                    <View style={styles.guestRow}>
                        {item.User?.UserProfile ? (
                            <Image source={{ uri: item.User.UserProfile.profilePicture }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.User?.fullName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.guestName}>{item.User?.fullName}</Text>
                            <Text style={styles.date}>{fDate(item.createdAt)}</Text>
                        </View>
                        <Text>{generateStars(Math.round(item.rating))}</Text>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                </Pressable>
            )}
            ListEmptyComponent={
                <View style={styles.emptyCard}>
                    <Ionicons name="star-outline" size={26} color={colors.grey} />
                    <Text style={styles.emptyText}>No reviews yet. Guests can review a place after their stay.</Text>
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
    list: {
        padding: 20,
        gap: 12,
    },
    summary: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
    },
    average: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.dark,
    },
    grey: {
        fontSize: 13,
        color: colors.grey,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
        gap: 10,
    },
    placeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#E6ECEA",
    },
    placeImage: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.primaryLight,
    },
    placeName: {
        flex: 1,
        fontWeight: "700",
        color: colors.primary,
    },
    guestRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.white,
        fontWeight: "800",
    },
    guestName: {
        fontWeight: "700",
        color: colors.dark,
    },
    date: {
        fontSize: 11,
        color: colors.grey,
    },
    message: {
        color: colors.dark,
        lineHeight: 20,
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 8,
    },
    emptyText: {
        color: colors.grey,
        textAlign: "center",
    },
});

export default PlaceReviews;