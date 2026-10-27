import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchDetail, fetchReviewByProperty } from "../../store/actions";
import { errorAlert } from "../helpers/alert";
import { fPrice } from "../helpers/fPrice";
import { fDate } from "../helpers/fDate";
import { generateStars } from "../helpers/fRating";
import { colors } from "../theme";

function Detail({ route }) {
    const { id } = route.params;
    const dispatch = useDispatch();
    const { detail } = useSelector((state) => state.propertyReducer);
    const { propertyReviews } = useSelector((state) => state.reviewReducer);
    const [loading, setLoading] = useState(true);
    const [imageIndex, setImageIndex] = useState(0);
    const { width } = useWindowDimensions();

    useEffect(() => {
        setLoading(true);
        dispatch(fetchReviewByProperty(id));
        dispatch(fetchDetail(id))
            .catch((error) => errorAlert(error))
            .finally(() => setLoading(false));
    }, [id]);

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
                        <View>
                            <Text style={styles.ownerName}>{owner.fullName}</Text>
                            <Text style={styles.grey}>Hosting on Settle</Text>
                        </View>
                    </View>
                </View>
            )}

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
});

export default Detail;