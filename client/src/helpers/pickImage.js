import * as ImagePicker from "expo-image-picker";

// Opens the gallery for one photo, cropped to the shape given (4:3 unless told otherwise)
export const pickImage = async (aspect = [4, 3]) => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect,
        quality: 0.7,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
};

// Opens the gallery to choose up to 10 photos at once
export const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 0.7,
    });

    if (!result.canceled) {
        return result.assets.map((asset) => asset.uri);
    }
    return [];
};

// The shape React Native needs to send a photo inside FormData
export const toFile = (uri, name) => {
    return { uri, name: name + ".jpg", type: "image/jpeg" };
};  