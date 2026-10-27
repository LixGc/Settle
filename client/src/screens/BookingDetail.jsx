import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById, createPayment, getUser } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { fDate } from "../helpers/fDate";
import { getStatusBackgroundColor } from "../helpers/getBg";
import { colors } from "../theme";

function BookingDetail({ route }) {
    const { id } = route.params;
    const dispatch = useDispatch();
    const { booking } = useSelector((state) => state.bookingReducer);
    const { profile } = useSelector((state) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState("");
    const paymentHandled = useRef(false);

    useEffect(() => {
        setLoading(true);
        dispatch(fetchBookingById(id))
            .catch((error) => errorAlert(error))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePayment = () => {
        setPaying(true);
        paymentHandled.current = false;
        dispatch(createPayment(id))
            .then((data) => setPaymentUrl(data.url))
            .catch((error) => errorAlert(error))
            .finally(() => setPaying(false));
    };

    // After paying, Stripe sends the WebView to the server's success or cancel page
    const handleNavigation = (navState) => {
        if (paymentHandled.current || navState.loading) return;
        if (navState.url.includes("/payments/success")) {
            paymentHandled.current = true;
            setPaymentUrl("");
            dispatch(fetchBookingById(id));
            dispatch(getUser());
            successAlert("Payment successful");
        } else if (navState.url.includes("/payments/cancel")) {
            paymentHandled.current = true;
            setPaymentUrl("");
            errorAlert("Payment cancelled");
        }
    };

    if (paymentUrl) {
        return <WebView source={{ uri: paymentUrl }} onNavigationStateChange={handleNavigation} startInLoadingState style={{ flex: 1 }} />;
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.center}>
                <Text style={styles.grey}>Booking not found</Text>
            </View>
        );
    }

    const property = booking.Property;
    const isTenant = booking.UserId === profile?.id;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {property && <Image source={{ uri: property.image }} style={styles.image} />}

            {/* property */}
            <View style={styles.section}>
                <Text style={styles.title}>{property ? property.name : "Removed property"}</Text>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={16} color={colors.grey} />
                    <Text style={styles.grey}>{property?.location}</Text>
                </View>
                {property?.User && (
                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={16} color={colors.grey} />
                        <Text style={styles.grey}>Hosted by {property.User.fullName}</Text>
                    </View>
                )}
            </View>

            {/* stay */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your stay</Text>
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.grey}>Check-in</Text>
                        <Text style={styles.value}>{fDate(booking.startDate)}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Text style={styles.grey}>Check-out</Text>
                        <Text style={styles.value}>{fDate(booking.endDate)}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Text style={styles.grey}>Status</Text>
                        <Text style={[styles.status, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>{booking.status}</Text>
                    </View>
                    <View style={[styles.cardRow, styles.totalRow]}>
                        <Text style={styles.value}>Total</Text>
                        <Text style={styles.total}>{fPrice(booking.totalPrice)}</Text>
                    </View>
                </View>
            </View>

            {/* payment */}
            {isTenant && booking.status === "pending" && (
                <View style={styles.section}>
                    <Pressable style={styles.payButton} onPress={handlePayment} disabled={paying}>
                        {paying ? <ActivityIndicator color={colors.white} /> : <Text style={styles.payText}>Pay with Stripe</Text>}
                    </Pressable>
                    <Text style={[styles.grey, { textAlign: "center" }]}>Your stay is confirmed once it's paid</Text>
                </View>
            )}
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
    image: {
        width: "100%",
        height: 220,
        backgroundColor: colors.primaryLight,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 6,
    },
    title: {
        fontSize: 22,
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
        color: colors.grey,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.dark,
        marginBottom: 4,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    cardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: "#E6ECEA",
        paddingTop: 12,
    },
    value: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.dark,
    },
    total: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.primary,
    },
    status: {
        color: colors.white,
        fontSize: 12,
        fontWeight: "700",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        overflow: "hidden",
        textTransform: "capitalize",
    },
    payButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
    },
    payText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});

export default BookingDetail;