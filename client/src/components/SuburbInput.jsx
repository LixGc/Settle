import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { searchSuburbs } from "../../store/actions";
import { colors } from "../theme";

// A suburb box with a list of matching Sydney suburbs under it.
// `chosen` is true once a suburb was picked from the list, so it stops searching
function SuburbInput({ value, chosen, onChangeText, onChoose }) {
    const dispatch = useDispatch();
    const [suburbs, setSuburbs] = useState([]);

    useEffect(() => {
        const search = value.trim();
        if (chosen || search.length < 2) {
            setSuburbs([]);
            return;
        }
        // Wait until the user stops typing for a moment, so it doesn't search on every letter
        const timer = setTimeout(() => {
            dispatch(searchSuburbs(search))
                .then((data) => setSuburbs(data))
                .catch(() => setSuburbs([]));
        }, 300);
        return () => clearTimeout(timer);
    }, [value, chosen]);

    const choose = (name) => {
        Keyboard.dismiss();
        onChoose(name);
    };

    return (
        <View style={styles.container}>
            <View style={styles.input}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <TextInput style={styles.textInput} placeholder="Start typing, like Bondi" autoCapitalize="words" value={value} onChangeText={onChangeText} />
            </View>
            {suburbs.length > 0 && (
                <View style={styles.dropdown}>
                    {suburbs.map((suburb) => (
                        <Pressable key={suburb.id} style={styles.dropdownItem} onPress={() => choose(suburb.name)}>
                            <Ionicons name="location-outline" size={16} color={colors.grey} />
                            <Text style={styles.dropdownText}>{suburb.name}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 6,
    },
    input: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#DDE5E2",
    },
    textInput: {
        flex: 1,
        paddingVertical: 14,
    },
    dropdown: {
        backgroundColor: colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DDE5E2",
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F3F2",
    },
    dropdownText: {
        color: colors.dark,
    },
});

export default SuburbInput;