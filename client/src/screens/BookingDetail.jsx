import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingById, createPayment, confirmPayment, getUser, updateBookingStatus } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { fDate } from "../helpers/fDate";
import { getStatusBackgroundColor } from "../helpers/getBg";
import ReviewModal from "../components/ReviewModal";
import { colors } from "../theme";

function BookingDetail({ route, navigation }) {
    const { id } = route.params;
    const dispatch = useDispatch();
    const { booking } = useSelector((state) => state.bookingReducer);
    const { profile } = useSelector((state) => state.userReducer);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState("");
    const [updating, setUpdating] = useState(false);
    const [reviewVisible, setReviewVisible] = useState(false);
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

    const handleComplete = () => {
        setUpdating(true);
        dispatch(updateBookingStatus("completed", id))
            .then((data) => successAlert(data.message))
            .catch((error) => errorAlert(error))
            .finally(() => setUpdating(false));
    };

    // After paying, Stripe sends the WebView to the server's success or cancel page.
    // The app then asks the server to check the payment, so the booking is marked as paid
    const handlePaymentLoad = ({ nativeEvent }) => {
        if (paymentHandled.current) return;
        if (nativeEvent.url.includes("/payments/success")) {
            paymentHandled.current = true;
            setPaymentUrl("");
            dispatch(confirmPayment(nativeEvent.url))
                .then(() => {
                    dispatch(fetchBookingById(id));
                    dispatch(getUser());
                    successAlert("Payment successful");
                })
                .catch((error) => errorAlert(error));
        } else if (nativeEvent.url.includes("/payments/cancel")) {
            paymentHandled.current = true;
            setPaymentUrl("");
            errorAlert("Payment cancelled");
        }
    };
    
    if (paymentUrl) {
        return <WebView source={{ uri: paymentUrl }} onLoad={handlePaymentLoad} startInLoadingState style={{ flex: 1 }} />;
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
    const isOwner = booking.ownerId === profile?.id;

    // The guest chats with the host, the host chats with the guest
    const chatWith = isOwner ? booking.User : property?.User;

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
                <Text style={styles.sectionTitle}>{isOwner ? "Guest stay" : "Your stay"}</Text>
                <View style={styles.card}>
                    <View style={styles.cardRow}>
                        <Text style={styles.grey}>Check-in</Text>
                        <Text style={styles.value}>{fDate(booking.startDate)}</Text>
                    </View>
                    <View style={styles.cardRow}>
                        <Text style={styles.grey}>Check-out</Text>
                        <Text style={styles.value}>{fDate(booking.endDate)}</Text>
                    </View>
                    {isOwner && (
                        <View style={styles.cardRow}>
                            <Text style={styles.grey}>Guest</Text>
                            <Text style={styles.value}>{booking.User?.fullName}</Text>
                        </View>
                    )}
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

            {/* chat */}
            {chatWith && (
                <View style={styles.section}>
                    <Pressable style={styles.chatButton} onPress={() => navigation.navigate("chatbox", { id: chatWith.id, name: chatWith.fullName })}>
                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                        <Text style={styles.chatText}>{isOwner ? "Message guest" : "Message host"}</Text>
                    </Pressable>
                </View>
            )}

            {/* payment */}
            {isTenant && booking.status === "pending" && (
                <View style={styles.section}>
                    <Pressable style={styles.payButton} onPress={handlePayment} disabled={paying}>
                        {paying ? <ActivityIndicator color={colors.white} /> : <Text style={styles.payText}>Pay with Stripe</Text>}
                    </Pressable>
                    <Text style={[styles.grey, { textAlign: "center" }]}>Your stay is confirmed once it's paid</Text>
                </View>
            )}

            {/* guest reviews the place after the stay */}
            {isTenant && booking.status === "completed" && property && (
                <View style={styles.section}>
                    <Pressable style={styles.payButton} onPress={() => setReviewVisible(true)}>
                        <Text style={styles.payText}>Write a review</Text>
                    </Pressable>
                    <ReviewModal visible={reviewVisible} property={property} onClose={() => setReviewVisible(false)} onSuccess={() => navigation.navigate("detail", { id: property.id, name: property.name })} />
                </View>
            )}

            {/* owner finishes the stay */}
            {isOwner && booking.status === "ongoing" && (
                <View style={styles.section}>
                    <Pressable style={styles.payButton} onPress={handleComplete} disabled={updating}>
                        {updating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.payText}>Mark as completed</Text>}
                    </Pressable>
                    <Text style={[styles.grey, { textAlign: "center" }]}>Do this after the guest checks out. The total goes to your balance.</Text>
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
    chatButton: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 12,
        padding: 13,
    },
    chatText: {
        color: colors.primary,
        fontWeight: "700",
        fontSize: 15,
    },
});

export default BookingDetail;