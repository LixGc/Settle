import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, ScrollView, Modal, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties, fetchTrending, fetchCategories } from "../../store/actions";
import PropertyCard from "../components/PropertyCard";
import PropertyListItem from "../components/PropertyListItem";
import { fDate } from "../helpers/fDate";
import { getStatusBackgroundColor } from "../helpers/getBg";
import { errorAlert } from "../helpers/alert";
import { colors } from "../theme";

const categoryIcons = {
    room: "bed-outline",
    studio: "cube-outline",
    apartment: "business-outline",
    house: "home-outline",
    townhouse: "albums-outline",
};

function Home({ navigation }) {
    const dispatch = useDispatch();
    const { properties, trending, loading } = useSelector((state) => state.propertyReducer);
    const { categories } = useSelector((state) => state.categoryReducer);
    const { profile } = useSelector((state) => state.userReducer);
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState([]);
    const [resultTitle, setResultTitle] = useState("");
    const [showResults, setShowResults] = useState(false);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchProperties());
            dispatch(fetchTrending());
            dispatch(fetchCategories());
        }, [])
    );

    const handleSearch = () => {
        const text = searchValue.trim().toLowerCase();
        if (!text) return;
        const found = properties.filter((item) => item.name.toLowerCase().includes(text) || item.location.toLowerCase().includes(text));
        setResults(found);
        setResultTitle(`Results for "${searchValue.trim()}"`);
        setShowResults(true);
    };

    const filterByCategory = (name) => {
        setResults(properties.filter((item) => item.Category?.name === name));
        setResultTitle(name.charAt(0).toUpperCase() + name.slice(1));
        setShowResults(true);
    };

    const goDetail = (item) => {
        setShowResults(false);
        navigation.navigate("detail", { id: item.id, name: item.name });
    };

    const goChats = () => {
        if (!profile) {
            errorAlert("Please log in first");
            return navigation.navigate("You");
        }
        navigation.navigate("conversationList");
    };

    if (loading && properties.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* header and search */}
                <View style={styles.header}>
                       <View style={styles.headerRow}>
                        <Text style={styles.greeting}>Hi{profile ? `, ${profile.fullName}` : ""}</Text>
                        <Pressable onPress={goChats}>
                            <Ionicons name="chatbubbles-outline" size={26} color={colors.white} />
                        </Pressable>
                    </View>
                    <Text style={styles.title}>Find your next place to settle</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={colors.grey} />
                        <TextInput
                            placeholder="Search by name or suburb"
                            value={searchValue}
                            onChangeText={setSearchValue}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                            style={styles.searchInput}
                        />
                    </View>
                </View>

                {/* categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={({ item }) => (
                            <Pressable style={styles.category} onPress={() => filterByCategory(item.name)}>
                                <View style={styles.categoryIcon}>
                                    <Ionicons name={categoryIcons[item.name] || "home-outline"} size={24} color={colors.primary} />
                                </View>
                                <Text style={styles.categoryName}>{item.name}</Text>
                            </Pressable>
                        )}
                    />
                </View>

                {/* trending */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Trending</Text>
                    {trending.length ? (
                        <FlatList data={trending} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <PropertyCard property={item} navigation={navigation} />} />
                    ) : (
                        <Text style={styles.emptyText}>No trending places yet</Text>
                    )}
                </View>

                {/* all places */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Places to stay</Text>
                    {properties.length ? (
                        <FlatList data={properties} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <PropertyCard property={item} navigation={navigation} />} />
                    ) : (
                        <Text style={styles.emptyText}>No places listed yet</Text>
                    )}
                </View>

                {/* history */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your stays</Text>
                    {!profile ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="time-outline" size={26} color={colors.grey} />
                            <Text style={styles.emptyText}>Log in to see your stays</Text>
                            <Pressable style={styles.smallButton} onPress={() => navigation.navigate("You")}>
                                <Text style={styles.smallButtonText}>Log in</Text>
                            </Pressable>
                        </View>
                    ) : profile.Bookings?.length ? (
                        <FlatList
                            data={profile.Bookings}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <View style={styles.stayCard}>
                                    {item.Property && <Image source={{ uri: item.Property.image }} style={styles.stayImage} />}
                                    <View style={{ flex: 1, gap: 3 }}>
                                        <Text style={styles.stayName} numberOfLines={1}>
                                            {item.Property ? item.Property.name : "Removed property"}
                                        </Text>
                                        <Text style={styles.stayDate}>
                                            {fDate(item.startDate)} - {fDate(item.endDate)}
                                        </Text>
                                        <Text style={[styles.status, { backgroundColor: getStatusBackgroundColor(item.status) }]}>{item.status}</Text>
                                    </View>
                                </View>
                            )}
                        />
                    ) : (
                        <View style={styles.emptyCard}>
                            <Ionicons name="time-outline" size={26} color={colors.grey} />
                            <Text style={styles.emptyText}>No stays yet. Book a place and it will show up here.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* search and category results */}
            <Modal visible={showResults} transparent animationType="slide" onRequestClose={() => setShowResults(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.sectionTitle}>{resultTitle}</Text>
                            <Pressable onPress={() => setShowResults(false)}>
                                <Ionicons name="close" size={26} color={colors.grey} />
                            </Pressable>
                        </View>
                        {results.length ? (
                            <FlatList data={results} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <PropertyListItem property={item} onPress={() => goDetail(item)} />} />
                        ) : (
                            <View style={styles.emptyCard}>
                                <Ionicons name="search-outline" size={26} color={colors.grey} />
                                <Text style={styles.emptyText}>No places found</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        backgroundColor: colors.primary,
        padding: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    greeting: {
        fontSize: 15,
        color: colors.primaryLight,
    },
    title: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: "800",
        color: colors.white,
    },
    searchContainer: {
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.dark,
        marginBottom: 12,
    },
    category: {
        alignItems: "center",
        marginRight: 18,
        gap: 6,
    },
    categoryIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primaryLight,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryName: {
        fontSize: 13,
        color: colors.dark,
        textTransform: "capitalize",
    },
    emptyText: {
        color: colors.grey,
        textAlign: "center",
    },
    emptyCard: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        gap: 8,
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
    stayCard: {
        width: 260,
        marginRight: 14,
        marginBottom: 24,
        flexDirection: "row",
        gap: 10,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 10,
    },
    stayImage: {
        width: 70,
        height: 70,
        borderRadius: 10,
    },
    stayName: {
        fontWeight: "700",
        color: colors.dark,
    },
    stayDate: {
        fontSize: 12,
        color: colors.grey,
    },
    status: {
        alignSelf: "flex-start",
        color: colors.white,
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: "hidden",
        textTransform: "capitalize",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalSheet: {
        height: "75%",
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
});

export default Home;