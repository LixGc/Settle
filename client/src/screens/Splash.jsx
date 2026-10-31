import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme";

// An apartment, a house and a bed pop in, then slide together into one home
const pieces = [
    { icon: "business", x: -96 },
    { icon: "home", x: 0 },
    { icon: "bed", x: 96 },
];
const letters = "Settle".split("");

function Splash() {
    const navigation = useNavigation();
    // Each value goes from 0 to 1 during its part of the animation
    const pops = useRef(pieces.map(() => new Animated.Value(0))).current;
    const gather = useRef(new Animated.Value(0)).current;
    const rise = useRef(new Animated.Value(0)).current;
    const letterValues = useRef(letters.map(() => new Animated.Value(0))).current;
    const tagline = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // A quick bounce that counts as finished once it has almost stopped, so the next part doesn't wait
        const spring = (value) => Animated.spring(value, { toValue: 1, speed: 16, bounciness: 10, restSpeedThreshold: 0.05, restDisplacementThreshold: 0.01, useNativeDriver: true });
        const timing = (value, duration) => Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: true });

        Animated.sequence([
            // 1. the apartment, house and bed pop in one after another
            Animated.stagger(160, pops.map(spring)),
            Animated.delay(150),
            // 2. they slide into the middle and become one house
            timing(gather, 400),
            // 3. the house moves up and the name comes in letter by letter
            Animated.parallel([timing(rise, 450), Animated.stagger(60, letterValues.map((value) => timing(value, 350)))]),
            timing(tagline, 250),
            Animated.delay(450),
        ]).start(({ finished }) => {
            // finished is false when the user tapped to skip
            if (finished) navigation.replace("home");
        });
    }, []);

    return (
        <Pressable style={styles.container} onPress={() => navigation.replace("home")}>
            <StatusBar style="light" />
            <Animated.View
                style={[
                    styles.stage,
                    {
                        transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }, { scale: rise.interpolate({ inputRange: [0, 1], outputRange: [1.25, 1] }) }],
                    },
                ]}
            >
                {pieces.map((piece, index) => {
                    const isHouse = piece.icon === "home";
                    // The apartment and bed fade into the house, and the house grows a little
                    const fade = gather.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
                    const grow = gather.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
                    return (
                        <Animated.View
                            key={piece.icon}
                            style={[
                                styles.badge,
                                isHouse && styles.houseBadge,
                                {
                                    opacity: isHouse ? pops[index] : Animated.multiply(pops[index], fade),
                                    transform: [{ translateX: gather.interpolate({ inputRange: [0, 1], outputRange: [piece.x, 0] }) }, { scale: isHouse ? Animated.multiply(pops[index], grow) : pops[index] }],
                                },
                            ]}
                        >
                            <Ionicons name={piece.icon} size={isHouse ? 42 : 32} color={colors.primary} />
                        </Animated.View>
                    );
                })}
            </Animated.View>

            <View style={styles.nameRow} accessible accessibilityLabel="Settle">
                {letters.map((letter, index) => (
                    <Animated.Text
                        key={index}
                        style={[
                            styles.letter,
                            {
                                opacity: letterValues[index],
                                transform: [{ translateY: letterValues[index].interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
                            },
                        ]}
                    >
                        {letter}
                    </Animated.Text>
                ))}
            </View>
            <Animated.Text style={[styles.tagline, { opacity: tagline }]}>Find your place</Animated.Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    stage: {
        width: 280,
        height: 100,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 18,
    },
    badge: {
        position: "absolute",
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    houseBadge: {
        width: 84,
        height: 84,
        borderRadius: 42,
    },
    nameRow: {
        flexDirection: "row",
    },
    letter: {
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