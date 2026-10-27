import * as ImagePicker from "expo-image-picker";

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