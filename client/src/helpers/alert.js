import { StyleSheet } from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { colors } from "../theme";

// Gets a readable message out of any error, the server's message first
export const getErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (typeof error?.response?.data === "string") return error.response.data;
    if (error?.message) return error.message;
    return "Something went wrong. Please try again.";
};

// Small popup at the top for errors
export const errorAlert = (msg) => {
    Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Oops...",
        textBody: msg,
        autoClose: 1500,
        textBodyStyle: styles.errorMsg,
        titleStyle: styles.errorMsg,
    });
};

// Same, for things that worked
export const successAlert = (msg) => {
    Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: msg,
        autoClose: 1500,
        titleStyle: styles.successMsg,
    });
};

const styles = StyleSheet.create({
    errorMsg: {
        color: colors.danger,
    },
    successMsg: {
        color: colors.dark,
    },
});