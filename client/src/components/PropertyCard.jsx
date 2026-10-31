import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

// Place card on Home (photo, name, suburb, price, rating), tap it to open the place
function PropertyCard({ property, navigation }) {
    const { id, name, image, price, location, averageRating, totalReviews } = property;

    const goDetail = () => {
        navigation.navigate("detail", { id, name });
    };

    return (
        <Pressable style={styles.container} onPress={goDetail}>
            <Image source={{ uri: image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {name}
                </Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={13} color={colors.grey} />
                    <Text style={styles.location} numberOfLines={1}>
                        {location}
                    </Text>
                </View>
                <View style={styles.rowBetween}>
                    <Text style={styles.price}>
                        {fPrice(price)}
                        <Text style={styles.night}> / night</Text>
                    </Text>
                    <View style={styles.row}>
                        <AntDesign name="star" size={12} color={colors.accent} />
                        <Text style={styles.rating}>
                            {averageRating} ({totalReviews})
                        </Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 220,
        marginRight: 14,
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    image: {
        width: "100%",
        height: 130,
        backgroundColor: colors.primaryLight,
    },
    info: {
        padding: 12,
        gap: 4,
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
    rowBetween: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
    },
    location: {
        fontSize: 12,
        color: colors.grey,
        flexShrink: 1,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    night: {
        fontSize: 12,
        fontWeight: "400",
        color: colors.grey,
    },
    rating: {
        fontSize: 12,
        color: colors.dark,
    },
});

export default PropertyCard;