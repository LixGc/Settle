import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, addProperty, editProperty, searchSuburbs } from "../../store/actions"; import { errorAlert, successAlert } from "../helpers/alert";
import { pickImage, pickImages, toFile } from "../helpers/pickImage";
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
    });
    const [CategoryId, setCategoryId] = useState(null);
    const [specifications, setSpecifications] = useState({});
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    // Suburbs matching what the host typed, and whether they picked one from that list
    const [suburbs, setSuburbs] = useState([]);
    const [suburbChosen, setSuburbChosen] = useState(Boolean(property));

    useEffect(() => {
        dispatch(fetchCategories());
    }, []);

    useEffect(() => {
        const search = input.location.trim();
        if (suburbChosen || search.length < 2) {
            setSuburbs([]);
            return;
        }
        // Wait until the host stops typing for a moment, so it doesn't search on every letter
        const timer = setTimeout(() => {
            dispatch(searchSuburbs(search))
                .then((data) => setSuburbs(data))
                .catch(() => setSuburbs([]));
        }, 300);
        return () => clearTimeout(timer);
    }, [input.location, suburbChosen]);

    const handleSuburbChange = (text) => {
        handleChangeInput("location", text);
        setSuburbChosen(false);
    };

    const chooseSuburb = (suburb) => {
        handleChangeInput("location", suburb.name);
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

    const chooseImage = async () => {
        const uri = await pickImage();
        if (uri) setImage(uri);
    };

    const chooseImages = async () => {
        const uris = await pickImages();
        if (uris.length) setImages(uris);
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
                <TextInput style={styles.textInput} placeholder="Start typing, like Bondi" autoCapitalize="words" value={input.location} onChangeText={handleSuburbChange} />
                {/* the host has to pick from this list, they can't add their own suburb */}
                {suburbs.length > 0 && (
                    <View style={styles.dropdown}>
                        {suburbs.map((suburb) => (
                            <Pressable key={suburb.id} style={styles.dropdownItem} onPress={() => chooseSuburb(suburb)}>
                                <Ionicons name="location-outline" size={16} color={colors.grey} />
                                <Text style={styles.dropdownText}>{suburb.name}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Street address</Text>
                <TextInput style={styles.textInput} placeholder="12 Church Street" value={input.address} onChangeText={(text) => handleChangeInput("address", text)} />
                <Text style={styles.grey}>Only guests who have booked and paid can see this. Everyone else sees the suburb.</Text>
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