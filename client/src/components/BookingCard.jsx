import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fPrice } from "../helpers/fPrice";
import { fDate } from "../helpers/fDate";
import { getStatusBackgroundColor } from "../helpers/getBg";
import { colors } from "../theme";

// A booking in a list. owner = true on Guest bookings, so it shows the guest instead of the suburb
function BookingCard({ booking, navigation, owner }) {
    const property = booking.Property;

    const goDetail = () => {
        navigation.navigate("bookingDetail", { id: booking.id });
    };

    return (
        <Pressable style={styles.container} onPress={goDetail}>
            {property && <Image source={{ uri: property.image }} style={styles.image} />}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {property ? property.name : "Removed property"}
                </Text>
                <View style={styles.row}>
                    {/* the owner sees who booked, the guest sees where */}
                    <Ionicons name={owner ? "person-outline" : "location-outline"} size={13} color={colors.grey} />
                    <Text style={styles.small}>{owner ? booking.User?.fullName : property?.location}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={13} color={colors.grey} />
                    <Text style={styles.small}>
                        {fDate(booking.startDate)} - {fDate(booking.endDate)}
                    </Text>
                </View>
                <Text style={styles.price}>{fPrice(booking.totalPrice)}</Text>
            </View>
            {/* Unpaid bookings say "Pay now" to the guest */}
            <Text style={[styles.status, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>{booking.status === "pending" && !owner ? "Pay now" : booking.status}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 10,
    },
    image: {
        width: 80,
        height: 80,
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
        color: colors.grey,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    status: {
        alignSelf: "flex-start",
        color: colors.white,
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        overflow: "hidden",
        textTransform: "capitalize",
    },
});

export default BookingCard;