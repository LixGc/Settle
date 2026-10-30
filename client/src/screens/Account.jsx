import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getUser, handleLogout } from "../../store/actions";
import { fPrice } from "../helpers/fPrice";
import { colors } from "../theme";

function MenuItem({ icon, title, info, onPress }) {
    return (
        <Pressable style={styles.menuItem} onPress={onPress}>
            <Ionicons name={icon} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
                <Text style={styles.menuTitle}>{title}</Text>
                <Text style={styles.menuInfo}>{info}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.grey} />
        </Pressable>
    );
}

function Account({ navigation }) {
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.userReducer);

    useFocusEffect(
        useCallback(() => {
            dispatch(getUser());
        }, [])
    );

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
                {/* profile */}
                <View style={styles.card}>
                    <View style={styles.profileRow}>
                        {profile?.UserProfile ? (
                            <Image source={{ uri: profile.UserProfile.profilePicture }} style={styles.profileImage} />
                        ) : (
                            <Ionicons name="person-circle" size={72} color={colors.primaryLight} />
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                            <Text style={styles.name}>{profile?.fullName}</Text>
                            <Text style={styles.grey}>{profile?.email}</Text>
                            <Text style={styles.grey}>{profile?.totalBookings || 0} bookings</Text>
                        </View>
                    </View>
                    <View style={styles.balance}>
                        <Text style={styles.grey}>Earned from hosting</Text>
                        <Text style={styles.balanceText}>{fPrice(profile?.totalAmount || 0)}</Text>
                    </View>
                    <Pressable style={styles.button} onPress={() => navigation.navigate("profile")}>
                        <Text style={styles.buttonText}>View my profile</Text>
                    </Pressable>
                </View>

                {/* staying */}
                <View style={{ gap: 8 }}>
                    <Text style={styles.sectionTitle}>Staying</Text>
                    <View style={styles.menu}>
                        <MenuItem icon="calendar-outline" title="My bookings" info="Places you have booked" onPress={() => navigation.navigate("Bookings")} />
                    </View>
                </View>

                {/* hosting */}
                <View style={{ gap: 8 }}>
                    <Text style={styles.sectionTitle}>Hosting</Text>
                    <View style={styles.menu}>
                        <MenuItem icon="add-circle-outline" title="List a place" info="Rent out your room or home" onPress={() => navigation.navigate("propertyForm")} />
                        <MenuItem icon="home-outline" title="My places" info="Edit or remove your listings" onPress={() => navigation.navigate("myProperties")} />
                        <MenuItem icon="people-outline" title="Guest bookings" info="Who is staying at your places" onPress={() => navigation.navigate("ownerBookings")} />
                        <MenuItem icon="star-outline" title="Reviews" info="What guests say about your places" onPress={() => navigation.navigate("placeReviews")} />
                    </View>
                </View>

                <Pressable style={styles.buttonLogout} onPress={() => dispatch(handleLogout())}>
                    <Text style={styles.buttonText}>Log out</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
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
        gap: 16,
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },
    profileImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.primaryLight,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.dark,
    },
    grey: {
        fontSize: 13,
        color: colors.grey,
    },
    balance: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 12,
    },
    balanceText: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 13,
        alignItems: "center",
    },
    buttonText: {
        color: colors.white,
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.grey,
    },
    menu: {
        backgroundColor: colors.white,
        borderRadius: 16,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
    },
    menuTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.dark,
    },
    menuInfo: {
        fontSize: 12,
        color: colors.grey,
    },
    buttonLogout: {
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: colors.danger,
    },
});

export default Account;