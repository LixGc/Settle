import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { colors } from "../theme";

function Home() {
    const { profile } = useSelector((state) => state.userReducer);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Hi{profile ? `, ${profile.fullName}` : ""}</Text>
                <Text style={styles.title}>Find your next place to settle</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
    },
    greeting: {
        fontSize: 16,
        color: colors.grey,
    },
    title: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: "800",
        color: colors.dark,
    },
});

export default Home;