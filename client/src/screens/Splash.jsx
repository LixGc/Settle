import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme";

function Splash() {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace("home");
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>Settle</Text>
            <Text style={styles.tagline}>Find your place</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        fontSize: 44,
        fontWeight: "800",
        color: colors.white,
        letterSpacing: 1,
    },
    tagline: {
        marginTop: 6,
        fontSize: 15,
        color: colors.primaryLight,
    },
});

export default Splash;