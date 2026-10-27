import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../store/actions";
import BookingCard from "../components/BookingCard";
import { colors } from "../theme";

const statuses = ["all", "pending", "ongoing", "completed"];

function Bookings({ navigation }) {
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.userReducer);
    const [selectedStatus, setSelectedStatus] = useState("all");

    useFocusEffect(
        useCallback(() => {
            dispatch(getUser());
        }, [])
    );

    if (!profile) {
        return (
            <SafeAreaView style={[styles.container, styles.center]}>
                <Ionicons name="calendar-outline" size={40} color={colors.grey} />
                <Text style={styles.emptyText}>Log in to see your bookings</Text>
                <Pressable style={styles.smallButton} onPress={() => navigation.navigate("You")}>
                    <Text style={styles.smallButtonText}>Log in</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // Newest booking first
    const bookings = [...(profile.Bookings || [])].sort((a, b) => b.id - a.id);
    const filteredBookings = selectedStatus === "all" ? bookings : bookings.filter((booking) => booking.status === selectedStatus);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <Text style={styles.title}>My bookings</Text>

            {/* status filter */}
            <View style={styles.tabs}>
                {statuses.map((status) => (
                    <Pressable key={status} style={[styles.tab, selectedStatus === status && styles.tabActive]} onPress={() => setSelectedStatus(status)}>
                        <Text style={[styles.tabText, selectedStatus === status && styles.tabTextActive]}>{status}</Text>
                    </Pressable>
                ))}
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => <BookingCard booking={item} navigation={navigation} />}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyCard}>
                        <Ionicons name="calendar-outline" size={26} color={colors.grey} />
                        <Text style={styles.emptyText}>{bookings.length ? "No bookings with this status" : "No bookings yet"}</Text>
                        {!bookings.length && (
                            <Pressable style={styles.smallButton} onPress={() => navigation.navigate("Home")}>
                                <Text style={styles.smallButtonText}>Find a place</Text>
                            </Pressable>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.dark,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    tabs: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: colors.white,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 13,
        color: colors.dark,
        textTransform: "capitalize",
    },
    tabTextActive: {
        color: colors.white,
        fontWeight: "700",
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    smallButton: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginTop: 4,
    },
    smallButtonText: {
        color: colors.white,
        fontWeight: "700",
    },
});

export default Bookings;