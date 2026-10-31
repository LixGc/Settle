import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocations, searchProperties } from "../../store/actions";
import DateInput from "../components/DateInput";
import PropertyListItem from "../components/PropertyListItem";
import SuburbCard from "../components/SuburbCard";
import SuburbInput from "../components/SuburbInput";
import { errorAlert } from "../helpers/alert";
import { fDate, toDateString, nextDay, countNights } from "../helpers/fDate";
import { colors } from "../theme";

// Explore tab: search a suburb with dates, or tap one of the popular suburbs
function Explore({ navigation }) {
    const dispatch = useDispatch();
    const { locations, searchResults } = useSelector((state) => state.propertyReducer);
    const scrollRef = useRef(null);
    const [location, setLocation] = useState("");
    // true once a suburb is picked from the dropdown, typing it isn't enough
    const [suburbChosen, setSuburbChosen] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(nextDay(new Date()));
    // The suburb and dates of the last search, so the results title stays right while the search box is changed
    const [searched, setSearched] = useState(null);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchLocations());
        }, [])
    );

    // If check-in moves past check-out, push check-out to the next day
    const handleStartChange = (date) => {
        setStartDate(date);
        if (countNights(date, endDate) < 1) {
            setEndDate(nextDay(date));
        }
    };

    // Typing again means the suburb has to be picked again
    const handleSuburbChange = (text) => {
        setLocation(text);
        setSuburbChosen(false);
    };

    const chooseSuburb = (name) => {
        setLocation(name);
        setSuburbChosen(true);
    };

    const search = (suburb) => {
        setSearched({ location: suburb, startDate, endDate });
        setLoading(true);
        // The results show under the search box, so scroll back up to them
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        dispatch(searchProperties({ location: suburb, startdate: toDateString(startDate), enddate: toDateString(endDate) })).finally(() => setLoading(false));
    };

    // Only search suburbs picked from the list, so the spelling matches the server
    const handleSearch = () => {
        if (!suburbChosen) {
            return errorAlert("Please choose a suburb from the list");
        }
        search(location);
    };

    // Tapping a suburb card fills in the search box and shows that suburb's places
    const seeSuburb = (name) => {
        chooseSuburb(name);
        search(name);
    };

    const clearSearch = () => {
        setSearched(null);
        setLocation("");
        setSuburbChosen(false);
    };

    const goDetail = (item) => {
        // Pass the dates on so the detail screen is ready to book them
        navigation.navigate("detail", { id: item.id, name: item.name, startDate: searched.startDate.getTime(), endDate: searched.endDate.getTime() });
    };

    // A suburb with no places at all gets a different message from one that is booked out
    const hasPlaces = searched && locations.some((item) => item.name === searched.location);

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>Find the right suburb</Text>
                    <Text style={styles.subtitle}>Search any suburb in Sydney, or start with a popular one below</Text>
                </View>

                {/* search box */}
                <View style={styles.card}>
                    <Text style={styles.label}>Where are you looking?</Text>
                    <SuburbInput value={location} chosen={suburbChosen} onChangeText={handleSuburbChange} onChoose={chooseSuburb} />
                    <View style={styles.dateRow}>
                        <DateInput label="Check-in" value={startDate} minimumDate={new Date()} onChange={handleStartChange} />
                        <DateInput label="Check-out" value={endDate} minimumDate={nextDay(startDate)} onChange={setEndDate} />
                    </View>
                    <Pressable style={styles.searchButton} onPress={handleSearch}>
                        <Ionicons name="search" size={18} color={colors.white} />
                        <Text style={styles.searchText}>Search</Text>
                    </Pressable>
                </View>

                {/* results */}
                {searched && (
                    <View style={styles.section}>
                        <View style={styles.resultsHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.sectionTitle}>Places in {searched.location}</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {fDate(searched.startDate)} - {fDate(searched.endDate)}
                                </Text>
                            </View>
                            <Pressable onPress={clearSearch}>
                                <Text style={styles.clear}>Clear</Text>
                            </Pressable>
                        </View>
                        {loading ? (
                            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                        ) : searchResults.length ? (
                            searchResults.map((item) => <PropertyListItem key={item.id} property={item} onPress={() => goDetail(item)} />)
                        ) : (
                            <View style={styles.emptyCard}>
                                <Ionicons name="search-outline" size={26} color={colors.grey} />
                                <Text style={styles.emptyText}>{hasPlaces ? `No places free in ${searched.location} on those dates` : `No places in ${searched.location} yet. Try one of the suburbs below.`}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* popular suburbs */}
                {locations.length > 0 && (
                    <View style={styles.popular}>
                        <Text style={[styles.sectionTitle, styles.popularText]}>Popular suburbs</Text>
                        <Text style={[styles.sectionSubtitle, styles.popularText]}>Not sure where to look? Start with a suburb that already has places.</Text>
                        <FlatList
                            data={locations}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.name}
                            contentContainerStyle={styles.popularList}
                            snapToInterval={274}
                            decelerationRate="fast"
                            renderItem={({ item }) => <SuburbCard suburb={item} onPress={() => seeSuburb(item.name)} />}
                        />
                    </View>
                )}
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
        fontSize: 26,
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
        fontSize: 15,
        fontWeight: "600",
        color: colors.dark,
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
    section: {
        paddingHorizontal: 20,
        paddingTop: 22,
    },
    resultsHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.dark,
    },
    sectionSubtitle: {
        marginTop: 2,
        fontSize: 13,
        color: colors.grey,
    },
    clear: {
        color: colors.primary,
        fontWeight: "700",
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 8,
        marginTop: 12,
    },
    emptyText: {
        color: colors.grey,
        textAlign: "center",
    },
    popular: {
        marginTop: 24,
        marginBottom: 24,
        paddingVertical: 20,
        backgroundColor: "#FDF0E1",
    },
    popularText: {
        paddingHorizontal: 20,
    },
    popularList: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 6,
    },
});

export default Explore;