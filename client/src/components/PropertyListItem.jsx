import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

// A place as a row, used in the search results
function PropertyListItem({ property, onPress }) {
    const { name, image, price, location, averageRating, totalReviews } = property;

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {name}
                </Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={13} color={colors.grey} />
                    <Text style={styles.small}>{location}</Text>
                </View>
                <View style={styles.row}>
                    <AntDesign name="star" size={12} color={colors.accent} />
                    <Text style={styles.small}>
                        {averageRating} ({totalReviews} reviews)
                    </Text>
                </View>
                <Text style={styles.price}>
                    {fPrice(price)}
                    <Text style={styles.small}> / night</Text>
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E6ECEA",
    },
    image: {
        width: 90,
        height: 72,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    name: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.dark,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    small: {
        fontSize: 12,
        fontWeight: "400",
        color: colors.grey,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
});

export default PropertyListItem;