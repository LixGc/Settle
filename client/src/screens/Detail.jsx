import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, ScrollView, Pressable, ActivityIndicator, useWindowDimensions, Linking } from "react-native"; import { AntDesign, Ionicons } from "@expo/vector-icons";
import MapView, { Circle, Marker } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";
import { fetchDetail, fetchReviewByProperty, fetchPropertyBookings, createBooking } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { fDate, toDateString, nextDay, countNights } from "../helpers/fDate";
import { generateStars } from "../helpers/fRating";
import DateInput from "../components/DateInput";
import { colors } from "../theme";

function Detail({ route, navigation }) {
    // startDate and endDate come from Explore, when the guest searched by dates
    const { id, startDate: searchStart, endDate: searchEnd } = route.params;
    const dispatch = useDispatch();
    const { detail } = useSelector((state) => state.propertyReducer);
    const { propertyReviews } = useSelector((state) => state.reviewReducer);
    const { propertyBookings } = useSelector((state) => state.bookingReducer);
    const { profile } = useSelector((state) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [imageIndex, setImageIndex] = useState(0);
    const [startDate, setStartDate] = useState(searchStart ? new Date(searchStart) : new Date());
    const [endDate, setEndDate] = useState(searchEnd ? new Date(searchEnd) : nextDay(new Date()));
    const [submitting, setSubmitting] = useState(false);
    const { width } = useWindowDimensions();

    useEffect(() => {
        setLoading(true);
        dispatch(fetchReviewByProperty(id));
        dispatch(fetchPropertyBookings(id));
        dispatch(fetchDetail(id))
            .catch((error) => errorAlert(error))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStartChange = (date) => {
        setStartDate(date);
        if (countNights(date, endDate) < 1) {
            setEndDate(nextDay(date));
        }
    };

    const handleBooking = () => {
        if (!profile) {
            errorAlert("Please log in first");
            return navigation.navigate("loginRegister");
        }
        setSubmitting(true);
        dispatch(createBooking({ startDate: toDateString(startDate), endDate: toDateString(endDate) }, id))
            .then((data) => {
                successAlert(data.message);
                dispatch(fetchPropertyBookings(id));
                navigation.navigate("bookingDetail", { id: data.id });
            })
            .catch((error) => errorAlert(error))
            .finally(() => setSubmitting(false));
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!detail) {
        return (
            <View style={styles.center}>
                <Text style={styles.grey}>Property not found</Text>
            </View>
        );
    }

    const { property, rating } = detail;
    const images = [property.image, ...property.PropertyImages.map((el) => el.imageUrl)];
    const owner = property.User;
    const nights = countNights(startDate, endDate);

    const goChat = () => {
        if (!profile) {
            errorAlert("Please log in first");
            return navigation.navigate("loginRegister");
        }
        navigation.navigate("chatbox", {
            id: owner.id,
            name: owner.fullName,
            property: { name: property.name, image: property.image, price: property.price },
        });
    };

    // Opens the suburb in the Google Maps app, or the Google Maps website if the app isn't installed
    const openMap = () => {
        Linking.openURL("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(property.location + " NSW"));
    };

    // Same check as the server: the stays overlap if one starts before the other ends
    const isBooked = propertyBookings.some((booking) => new Date(toDateString(startDate)) < new Date(booking.endDate) && new Date(toDateString(endDate)) > new Date(booking.startDate));
    const upcomingBookings = propertyBookings.filter((booking) => new Date(booking.endDate) >= new Date(toDateString(new Date())));

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* photos */}
            <View>
                <FlatList
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => String(index)}
                    onMomentumScrollEnd={(event) => setImageIndex(Math.round(event.nativeEvent.contentOffset.x / width))}
                    renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: 260, backgroundColor: colors.primaryLight }} />}
                />
                <Text style={styles.imageCounter}>
                    {imageIndex + 1} / {images.length}
                </Text>
            </View>

            {/* main info */}
            <View style={styles.section}>
                <Text style={styles.category}>{property.Category?.name}</Text>
                <Text style={styles.title}>{property.name}</Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={16} color={colors.grey} />
                    <Text style={styles.grey}>{property.location}</Text>
                </View>
                <View style={styles.row}>
                    <AntDesign name="star" size={14} color={colors.accent} />
                    <Text style={styles.grey}>{property.Reviews.length ? `${rating} (${property.Reviews.length} reviews)` : "No reviews yet"}</Text>
                </View>
                <Text style={styles.price}>
                    {fPrice(property.price)}
                    <Text style={styles.grey}> / night</Text>
                </Text>
            </View>

            {/* specifications */}
            {property.Specifications.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About this place</Text>
                    <View style={styles.specContainer}>
                        {property.Specifications.map((spec) => (
                            <View style={styles.spec} key={spec.id}>
                                <Text style={styles.specName}>{spec.name}</Text>
                                <Text style={styles.specValue}>{spec.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* map, only the suburb is shown, not the exact address */}
            {property.latitude ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Where you'll be</Text>
                    {/* the box rounds the corners, a map can't do that by itself on Android */}
                    <View style={styles.mapBox}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={{ latitude: property.latitude, longitude: property.longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
                            scrollEnabled={false}
                            zoomEnabled={false}
                            rotateEnabled={false}
                            pitchEnabled={false}
                        >
                            <Circle center={{ latitude: property.latitude, longitude: property.longitude }} radius={800} strokeColor={colors.primary} fillColor="rgba(31, 111, 92, 0.2)" />
                            {/* a house in the middle of the area, with no point, since it isn't the exact spot */}
                            <Marker coordinate={{ latitude: property.latitude, longitude: property.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
                                <View style={styles.areaIcon}>
                                    <Ionicons name="home" size={16} color={colors.white} />
                                </View>
                            </Marker>
                        </MapView>
                    </View>
                    <Text style={styles.small}>The map shows the area, not the exact spot. You'll get the full address after you book and pay.</Text>
                    <Pressable style={styles.mapButton} onPress={openMap}>
                        <Ionicons name="navigate-outline" size={18} color={colors.primary} />
                        <Text style={styles.mapButtonText}>Open in Google Maps</Text>
                    </Pressable>
                </View>
            ) : null}

            {/* owner */}
            {owner && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Owner</Text>
                    <View style={styles.ownerCard}>
                        {owner.UserProfile?.profilePicture ? (
                            <Image source={{ uri: owner.UserProfile.profilePicture }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{owner.fullName.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.ownerName}>{owner.fullName}</Text>
                            <Text style={styles.grey}>Hosting on Settle</Text>
                        </View>
                        {/* no chat button on your own place */}
                        {owner.id !== profile?.id && (
                            <Pressable style={styles.chatButton} onPress={goChat}>
                                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}

            {/* booking */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Book your stay</Text>
                <View style={styles.dateRow}>
                    <DateInput label="Check-in" value={startDate} minimumDate={new Date()} onChange={handleStartChange} />
                    <DateInput label="Check-out" value={endDate} minimumDate={nextDay(startDate)} onChange={setEndDate} />
                </View>
                {upcomingBookings.length > 0 && <Text style={styles.small}>Already booked: {upcomingBookings.map((booking) => `${fDate(booking.startDate)} - ${fDate(booking.endDate)}`).join(", ")}</Text>}
                <View style={styles.rowBetween}>
                    <Text style={styles.grey}>
                        {fPrice(property.price)} x {nights} {nights === 1 ? "night" : "nights"}
                    </Text>
                    <Text style={styles.total}>{fPrice(property.price * nights)}</Text>
                </View>
                {isBooked ? (
                    <View style={[styles.bookButton, { backgroundColor: colors.danger }]}>
                        <Text style={styles.bookText}>Not available on these dates</Text>
                    </View>
                ) : (
                    <Pressable style={styles.bookButton} onPress={handleBooking} disabled={submitting}>
                        {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.bookText}>Book now</Text>}
                    </Pressable>
                )}
            </View>

            {/* reviews */}
            <View style={[styles.section, { paddingBottom: 40 }]}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                {propertyReviews.length ? (
                    propertyReviews.map((review) => (
                        <View style={styles.review} key={review.id}>
                            <View style={styles.avatarSmall}>
                                <Text style={styles.avatarText}>{review.User?.fullName.charAt(0)}</Text>
                            </View>
                            <View style={{ flex: 1, gap: 3 }}>
                                <Text style={styles.ownerName}>{review.User?.fullName}</Text>
                                <Text>{generateStars(Math.round(review.rating))}</Text>
                                <Text style={styles.reviewDate}>{fDate(review.createdAt)}</Text>
                                <Text style={styles.reviewMessage}>{review.message}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.grey}>No reviews yet</Text>
                )}
            </View>
        </ScrollView>
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
    imageCounter: {
        position: "absolute",
        right: 14,
        bottom: 14,
        backgroundColor: "rgba(0,0,0,0.55)",
        color: colors.white,
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: "hidden",
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 6,
    },
    category: {
        alignSelf: "flex-start",
        backgroundColor: colors.primaryLight,
        color: colors.primary,
        fontWeight: "700",
        fontSize: 12,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        overflow: "hidden",
        textTransform: "capitalize",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: colors.dark,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    grey: {
        fontSize: 14,
        fontWeight: "400",
        color: colors.grey,
    },
    price: {
        marginTop: 6,
        fontSize: 20,
        fontWeight: "800",
        color: colors.primary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.dark,
        marginBottom: 4,
    },
    specContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    spec: {
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
        minWidth: 100,
    },
    specName: {
        fontSize: 12,
        color: colors.grey,
        textTransform: "capitalize",
    },
    specValue: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.dark,
        textTransform: "capitalize",
    },
    ownerCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarSmall: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        color: colors.white,
        fontWeight: "800",
        fontSize: 16,
    },
    ownerName: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.dark,
    },
    chatButton: {
        backgroundColor: colors.primaryLight,
        borderRadius: 12,
        padding: 10,
    },
    mapBox: {
        height: 180,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.primaryLight,
    },
    areaIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
    mapButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
    },
    mapButtonText: {
        color: colors.primary,
        fontWeight: "700",
    },
    review: {
        flexDirection: "row",
        gap: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
    },
    reviewDate: {
        fontSize: 11,
        color: colors.grey,
    },
    reviewMessage: {
        marginTop: 4,
        color: colors.dark,
    },
    dateRow: {
        flexDirection: "row",
        gap: 12,
    },
    small: {
        fontSize: 12,
        color: colors.grey,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    total: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.dark,
    },
    bookButton: {
        marginTop: 6,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
    },
    bookText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});

export default Detail;