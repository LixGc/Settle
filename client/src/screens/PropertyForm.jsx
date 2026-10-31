import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, addProperty, editProperty } from "../../store/actions";
import { errorAlert, successAlert } from "../helpers/alert";
import { pickImage, pickImages, toFile } from "../helpers/pickImage";
import SuburbInput from "../components/SuburbInput";
import { amenityList } from "../helpers/amenities";
import { colors } from "../theme";

// The choices for each detail, so every listing uses the same words.
// A detail that isn't listed here (from a new category) is typed in instead
const specOptions = {
    bedrooms: ["1", "2", "3", "4", "5+"],
    bathrooms: ["1", "2", "3", "4+"],
    bathroom: ["private", "shared", "ensuite"],
    furnished: ["yes", "no"],
    bills: ["included", "not included"],
    parking: ["no", "street", "1 car space", "single garage", "double garage"],
};

function PropertyForm({ route, navigation }) {
    // id is only passed when editing a place
    const id = route.params?.id;
    const dispatch = useDispatch();
    const { categories } = useSelector((state) => state.categoryReducer);
    const { myProperties } = useSelector((state) => state.propertyReducer);
    const property = myProperties.find((item) => item.id === id);
    const [input, setInput] = useState({
        name: property ? property.name : "",
        price: property ? String(property.price) : "",
        location: property ? property.location : "",
        address: property?.address || "",
        description: property?.description || "",
    });
    const [CategoryId, setCategoryId] = useState(null);
    const [specifications, setSpecifications] = useState({});
    const [amenities, setAmenities] = useState(property?.amenities || []);
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    // Which photo button is opening the gallery ("main" or "more"), to show a spinner on it
    const [picking, setPicking] = useState(null);
    // Whether the host picked the suburb from the list
    const [suburbChosen, setSuburbChosen] = useState(Boolean(property));

    useEffect(() => {
        dispatch(fetchCategories());
    }, []);

    const handleSuburbChange = (text) => {
        handleChangeInput("location", text);
        setSuburbChosen(false);
    };

    const chooseSuburb = (name) => {
        handleChangeInput("location", name);
        setSuburbChosen(true);
    };

    // Each category has its own details, saved on the server as a JSON string like '["bedrooms","parking"]'
    const category = categories.find((item) => item.id === CategoryId);
    const specNames = category ? JSON.parse(category.specifications) : [];

    const handleChangeInput = (name, text) => {
        setInput((input) => ({
            ...input,
            [name]: text,
        }));
    };

    const handleChangeSpec = (name, value) => {
        setSpecifications((specifications) => ({
            ...specifications,
            [name]: value,
        }));
    };

    // Tap an amenity to tick it, and tap it again to untick it
    const toggleAmenity = (key) => {
        setAmenities((amenities) => (amenities.includes(key) ? amenities.filter((item) => item !== key) : [...amenities, key]));
    };

    // The gallery can take a moment to open, so show a spinner until it does and ignore extra taps
    const chooseImage = async () => {
        if (picking) return;
        setPicking("main");
        try {
            const uri = await pickImage();
            if (uri) setImage(uri);
        } catch (error) {
            errorAlert("Could not open your photos");
        } finally {
            setPicking(null);
        }
    };

    const chooseImages = async () => {
        if (picking) return;
        setPicking("more");
        try {
            const uris = await pickImages();
            if (uris.length) setImages(uris);
        } catch (error) {
            errorAlert("Could not open your photos");
        } finally {
            setPicking(null);
        }
    };

    const handleSubmit = () => {
        if (!property && !image) {
            return errorAlert("Please choose a main photo");
        }
        if (!property && !CategoryId) {
            return errorAlert("Please choose the type of place");
        }
        if (specNames.some((name) => !specifications[name])) {
            return errorAlert("Please fill in all the details");
        }
        if (!suburbChosen) {
            return errorAlert("Please choose a suburb from the list");
        }
        if (!input.address) {
            return errorAlert("Please add the street address");
        }

        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("price", input.price);
        formData.append("location", input.location);
        formData.append("address", input.address);
        formData.append("description", input.description);
        formData.append("amenities", JSON.stringify(amenities));
        formData.append("CategoryId", property ? property.CategoryId : CategoryId);
        if (image) {
            formData.append("image", toFile(image, "image"));
        }
        images.forEach((uri, index) => formData.append("images", toFile(uri, "image" + index)));
        if (!property) {
            formData.append("specifications", JSON.stringify(specNames.map((name) => ({ name, value: specifications[name] }))));
        }

        setLoading(true);
        const action = property ? editProperty(formData, id) : addProperty(formData);
        dispatch(action)
            .then((data) => {
                successAlert(data.message);
                navigation.goBack();
            })
            .catch((error) => errorAlert(error))
            .finally(() => setLoading(false));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }} automaticallyAdjustKeyboardInsets keyboardShouldPersistTaps="handled">
            {/* main photo */}
            <Pressable onPress={chooseImage}>
                {image || property ? (
                    <Image source={{ uri: image || property.image }} style={styles.mainPhoto} />
                ) : (
                    <View style={[styles.mainPhoto, styles.photoEmpty]}>
                        <Ionicons name="camera-outline" size={30} color={colors.primary} />
                        <Text style={styles.grey}>Choose a main photo</Text>
                    </View>
                )}
                {picking === "main" && (
                    <View style={styles.photoLoading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.grey}>Opening your photos...</Text>
                    </View>
                )}
            </Pressable>

            {/* more photos */}
            <View style={styles.field}>
                <Text style={styles.label}>More photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {images.map((uri) => (
                        <Image key={uri} source={{ uri }} style={styles.smallPhoto} />
                    ))}
                    <Pressable style={[styles.smallPhoto, styles.photoEmpty]} onPress={chooseImages}>
                        <Ionicons name="images-outline" size={22} color={colors.primary} />
                    </Pressable>
                </ScrollView>
                {property && <Text style={styles.grey}>New photos are added to the ones already there</Text>}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.textInput} placeholder="Cosy room near the station" value={input.name} onChangeText={(text) => handleChangeInput("name", text)} />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Price per night (AUD)</Text>
                <TextInput style={styles.textInput} placeholder="80" keyboardType="number-pad" value={input.price} onChangeText={(text) => handleChangeInput("price", text)} />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Suburb</Text>
                {/* the host has to pick from the list, they can't add their own suburb */}
                <SuburbInput value={input.location} chosen={suburbChosen} onChangeText={handleSuburbChange} onChoose={chooseSuburb} />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Street address</Text>
                <TextInput style={styles.textInput} placeholder="12 Church Street" value={input.address} onChangeText={(text) => handleChangeInput("address", text)} />
                <Text style={styles.grey}>Only guests who have booked and paid can see this. Everyone else sees the suburb.</Text>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput style={[styles.textInput, styles.textArea]} placeholder="What's the place like, and what's nearby?" multiline maxLength={1000} value={input.description} onChangeText={(text) => handleChangeInput("description", text)} />
                <Text style={styles.grey}>{input.description.length}/1000</Text>
            </View>

            {/* type and details, only when listing a new place */}
            {!property && (
                <View style={styles.field}>
                    <Text style={styles.label}>Type of place</Text>
                    <View style={styles.chips}>
                        {categories.map((item) => (
                            <Pressable key={item.id} style={[styles.chip, CategoryId === item.id && styles.chipActive]} onPress={() => setCategoryId(item.id)}>
                                <Text style={[styles.chipText, CategoryId === item.id && styles.chipTextActive]}>{item.name}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}
            {specNames.map((name) => (
                <View style={styles.field} key={name}>
                    <Text style={[styles.label, { textTransform: "capitalize" }]}>{name}</Text>
                    {specOptions[name] ? (
                        <View style={styles.chips}>
                            {specOptions[name].map((option) => (
                                <Pressable key={option} style={[styles.chip, specifications[name] === option && styles.chipActive]} onPress={() => handleChangeSpec(name, option)}>
                                    <Text style={[styles.chipText, specifications[name] === option && styles.chipTextActive]}>{option}</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <TextInput style={styles.textInput} value={specifications[name] || ""} onChangeText={(text) => handleChangeSpec(name, text)} />
                    )}
                </View>
            ))}

            <View style={styles.field}>
                <Text style={styles.label}>What this place offers</Text>
                <View style={styles.chips}>
                    {amenityList.map((item) => {
                        const ticked = amenities.includes(item.key);
                        return (
                            <Pressable key={item.key} style={[styles.chip, styles.amenityChip, ticked && styles.chipActive]} onPress={() => toggleAmenity(item.key)}>
                                <Ionicons name={item.icon} size={16} color={ticked ? colors.white : colors.primary} />
                                <Text style={[styles.chipText, styles.amenityText, ticked && styles.chipTextActive]}>{item.label}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>{property ? "Save changes" : "List my place"}</Text>}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    mainPhoto: {
        width: "100%",
        height: 190,
        borderRadius: 16,
        backgroundColor: colors.primaryLight,
    },
    photoEmpty: {
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.primary,
    },
    photoLoading: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: "rgba(227,241,236,0.95)",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    smallPhoto: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: colors.primaryLight,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.dark,
    },
    grey: {
        fontSize: 12,
        color: colors.grey,
    },
    textInput: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#DDE5E2",
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: "top",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
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
        textTransform: "capitalize",
    },
    chipTextActive: {
        color: colors.white,
    },
    amenityChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    amenityText: {
        textTransform: "none",
    },
    button: {
        marginTop: 6,
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
    },
    buttonText: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
});

export default PropertyForm;