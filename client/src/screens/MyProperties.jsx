import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyProperties, fetchOwnerBookings } from "../../store/actions";
import MyPropertyCard from "../components/MyPropertyCard";
import { colors } from "../theme";

function MyProperties({ navigation }) {
    const dispatch = useDispatch();
    const { myProperties } = useSelector((state) => state.propertyReducer);
    const { ownerBookings } = useSelector((state) => state.bookingReducer);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchMyProperties());
            dispatch(fetchOwnerBookings());
        }, [])
    );

    return (
        <FlatList
            style={styles.container}
            data={myProperties}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <MyPropertyCard property={item} bookings={ownerBookings.filter((booking) => booking.PropertyId === item.id)} navigation={navigation} />}
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                <Pressable style={styles.addButton} onPress={() => navigation.navigate("propertyForm")}>
                    <Ionicons name="add" size={20} color={colors.white} />
                    <Text style={styles.addText}>List a place</Text>
                </Pressable>
            }
            ListEmptyComponent={
                <View style={styles.emptyCard}>
                    <Ionicons name="home-outline" size={26} color={colors.grey} />
                    <Text style={styles.emptyText}>You haven't listed any places yet</Text>
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
    addButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 13,
    },
    addText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 15,
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

export default MyProperties;