import React, { useCallback } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerBookings } from "../../store/actions";
import BookingCard from "../components/BookingCard";
import { colors } from "../theme";

function OwnerBookings({ navigation }) {
    const dispatch = useDispatch();
    const { ownerBookings } = useSelector((state) => state.bookingReducer);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchOwnerBookings());
        }, [])
    );

    return (
        <FlatList
            style={styles.container}
            data={ownerBookings}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <BookingCard booking={item} navigation={navigation} owner />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
                <View style={styles.emptyCard}>
                    <Ionicons name="people-outline" size={26} color={colors.grey} />
                    <Text style={styles.emptyText}>No one has booked your places yet</Text>
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

export default OwnerBookings;