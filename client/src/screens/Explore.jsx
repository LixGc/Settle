import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocations, searchProperties } from "../../store/actions";
import DateInput from "../components/DateInput";
import PropertyListItem from "../components/PropertyListItem";
import { errorAlert } from "../helpers/alert";
import { toDateString, nextDay, countNights } from "../helpers/fDate";
import { colors } from "../theme";

function Explore({ navigation }) {
    const dispatch = useDispatch();
    const { locations, searchResults } = useSelector((state) => state.propertyReducer);
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(nextDay(new Date()));
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchLocations());
        }, [])
    );

    const handleStartChange = (date) => {
        setStartDate(date);
        if (countNights(date, endDate) < 1) {
            setEndDate(nextDay(date));
        }
    };

    const search = () => {
        if (!location) {
            return errorAlert("Please choose a suburb");
        }
        setLoading(true);
        dispatch(searchProperties({ location, startdate: toDateString(startDate), enddate: toDateString(endDate) })).finally(() => {
            setLoading(false);
            setSearched(true);
        });
    };

    const goDetail = (item) => {
        // Pass the dates on so the detail screen is ready to book them
        navigation.navigate("detail", { id: item.id, name: item.name, startDate: startDate.getTime(), endDate: endDate.getTime() });
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Explore</Text>
                    <Text style={styles.subtitle}>Find a place that's free on your dates</Text>
                </View>

                {/* search form */}
                <View style={styles.card}>
                    <Text style={styles.label}>Suburb</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {locations.map((item) => (
                            <Pressable key={item} style={[styles.chip, location === item && styles.chipActive]} onPress={() => setLocation(item)}>
                                <Text style={[styles.chipText, location === item && styles.chipTextActive]}>{item}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                    <View style={styles.dateRow}>
                        <DateInput label="Check-in" value={startDate} minimumDate={new Date()} onChange={handleStartChange} />
                        <DateInput label="Check-out" value={endDate} minimumDate={nextDay(startDate)} onChange={setEndDate} />
                    </View>
                    <Pressable style={styles.searchButton} onPress={search}>
                        <Ionicons name="search" size={18} color={colors.white} />
                        <Text style={styles.searchText}>Search</Text>
                    </Pressable>
                </View>

                {/* results */}
                <View style={styles.results}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : searched && searchResults.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="search-outline" size={26} color={colors.grey} />
                            <Text style={styles.emptyText}>No places free in {location} on those dates</Text>
                        </View>
                    ) : (
                        searched && searchResults.map((item) => <PropertyListItem key={item.id} property={item} onPress={() => goDetail(item)} />)
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        paddingBottom: 50,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.white,
    },
    subtitle: {
        marginTop: 4,
        fontSize: 15,
        color: colors.primaryLight,
    },
    card: {
        backgroundColor: colors.white,
        marginHorizontal: 20,
        marginTop: -34,
        borderRadius: 16,
        padding: 16,
        gap: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
    },
    label: {
        fontSize: 12,
        color: colors.grey,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: colors.primaryLight,
    },
    chipActive: {
        backgroundColor: colors.primary,
    },
    chipText: {
        color: colors.primary,
        fontWeight: "600",
    },
    chipTextActive: {
        color: colors.white,
    },
    dateRow: {
        flexDirection: "row",
        gap: 12,
    },
    searchButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
    },
    searchText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    results: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
    emptyText: {
        color: colors.grey,
        textAlign: "center",
    },
});

export default Explore;