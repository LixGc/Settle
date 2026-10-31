import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

function SuburbCard({ suburb, onPress }) {
    const { name, image, totalPlaces, lowestPrice, averageRating, totalReviews, favourite, kmToCity } = suburb;

    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View>
                <Image source={{ uri: image }} style={styles.image} />
                <Text style={styles.badge}>
                    {totalPlaces} {totalPlaces === 1 ? "place" : "places"}
                </Text>
            </View>
            <View style={styles.body}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.price}>
                    From {fPrice(lowestPrice)}
                    <Text style={styles.night}> / night</Text>
                </Text>

                <View style={styles.tags}>
                    <View style={[styles.tag, styles.tagGreen]}>
                        <Ionicons name="car-outline" size={14} color={colors.primary} />
                        <Text style={styles.tagGreenText}>{kmToCity < 1 ? "In the city" : `${kmToCity} km to the city`}</Text>
                    </View>
                    <View style={styles.tag}>
                        <AntDesign name="star" size={12} color={colors.accent} />
                        <Text style={styles.tagText}>{totalReviews ? `${averageRating} (${totalReviews} reviews)` : "No reviews yet"}</Text>
                    </View>
                </View>

                {favourite && (
                    <View style={styles.highlight}>
                        <Text style={styles.highlightText} numberOfLines={2}>
                            Guests' favourite: {favourite}
                        </Text>
                        <Ionicons name="sparkles" size={18} color={colors.accent} />
                    </View>
                )}

                <View style={styles.linkRow}>
                    <Text style={styles.link}>See places in {name}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 260,
        marginRight: 14,
        backgroundColor: colors.white,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    image: {
        width: "100%",
        height: 150,
        backgroundColor: colors.primaryLight,
    },
    badge: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: colors.white,
        color: colors.dark,
        fontSize: 12,
        fontWeight: "700",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: "hidden",
    },
    body: {
        flex: 1,
        padding: 16,
        gap: 6,
    },
    name: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.dark,
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.dark,
    },
    night: {
        fontSize: 13,
        fontWeight: "400",
        color: colors.grey,
    },
    tags: {
        marginTop: 6,
        gap: 8,
        alignItems: "flex-start",
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#F0F3F2",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    tagText: {
        fontSize: 13,
        color: colors.dark,
    },
    tagGreen: {
        backgroundColor: colors.primaryLight,
    },
    tagGreenText: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.primary,
    },
    highlight: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        backgroundColor: "#FFF6EC",
        borderWidth: 1,
        borderColor: "#F9D3A8",
        borderRadius: 12,
        padding: 12,
    },
    highlightText: {
        flex: 1,
        fontSize: 13,
        color: colors.dark,
    },
    linkRow: {
        marginTop: "auto",
        paddingTop: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    link: {
        color: colors.primary,
        fontWeight: "700",
        textDecorationLine: "underline",
    },
});

export default SuburbCard;