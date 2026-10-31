import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { fDate } from "../helpers/fDate";
import { colors } from "../theme";

// Date box for check-in and check-out. Android opens a calendar popup, iOS has its own date button
function DateInput({ label, value, minimumDate, onChange }) {
    const openCalendar = () => {
        DateTimePickerAndroid.open({
            value,
            mode: "date",
            minimumDate,
            onValueChange: (event, date) => onChange(date),
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            {Platform.OS === "ios" ? (
                // iOS has its own date button that opens a calendar
                <DateTimePicker value={value} mode="date" minimumDate={minimumDate} onValueChange={(event, date) => onChange(date)} style={styles.iosPicker} />
            ) : (
                <Pressable style={styles.input} onPress={openCalendar}>
                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                    <Text style={styles.value}>{fDate(value)}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 6,
    },
    label: {
        fontSize: 12,
        color: colors.grey,
    },
    input: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: "#E6ECEA",
        borderRadius: 12,
        padding: 12,
    },
    value: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.dark,
    },
    iosPicker: {
        alignSelf: "flex-start",
    },
});

export default DateInput;