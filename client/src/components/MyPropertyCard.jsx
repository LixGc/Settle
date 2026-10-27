import React from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { deleteProperty } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

function MyPropertyCard({ property, bookings, navigation }) {
    const dispatch = useDispatch();

    // Like RentNRoll, a place can only be removed when nobody is booked in
    const canDelete = bookings.every((booking) => booking.status === "completed");

    const removeProperty = () => {
        dispatch(deleteProperty(property.id))
            .then(() => successAlert("Place removed"))
            .catch((error) => errorAlert(error));
    };

    const confirmDelete = () => {
        Alert.alert("Remove this place?", property.name, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: removeProperty },
        ]);
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: property.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {property.name}
                </Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={13} color={colors.grey} />
                    <Text style={styles.small}>{property.location}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={13} color={colors.grey} />
                    <Text style={styles.small}>
                        {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                    </Text>
                </View>
                <Text style={styles.price}>
                    {fPrice(property.price)}
                    <Text style={styles.small}> / night</Text>
                </Text>
            </View>
            <View style={styles.actions}>
                <Pressable style={styles.editButton} onPress={() => navigation.navigate("propertyForm", { id: property.id })}>
                    <MaterialIcons name="edit" size={16} color={colors.white} />
                </Pressable>
                {canDelete && (
                    <Pressable style={styles.deleteButton} onPress={confirmDelete}>
                        <MaterialIcons name="delete-forever" size={16} color={colors.white} />
                    </Pressable>
                )}
            </View>
        </View>
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
        fontWeight: "400",
        color: colors.grey,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.primary,
    },
    actions: {
        gap: 8,
    },
    editButton: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: colors.danger,
        padding: 8,
        borderRadius: 8,
    },
});

export default MyPropertyCard;