import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "../../store/actions";
import { colors } from "../theme";

function Account() {
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.userReducer);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.name}>{profile?.fullName}</Text>
                <Text style={styles.email}>{profile?.email}</Text>
            </View>
            <Pressable style={styles.buttonLogout} onPress={() => dispatch(handleLogout())}>
                <Text style={styles.textLogout}>Log out</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.dark,
    },
    email: {
        marginTop: 4,
        color: colors.grey,
    },
    buttonLogout: {
        marginTop: 20,
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: colors.danger,
    },
    textLogout: {
        color: colors.white,
        fontWeight: "700",
    },
});

export default Account;