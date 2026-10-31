import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { createOtp, handleLogin, registerHandler, getUser } from "../../store/actions";
import { errorAlert, successAlert, getErrorMessage } from "../helpers/alert";
import { colors } from "../theme";

function LoginRegister({ navigation }) {
    const [inputRegister, setInputRegister] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
    });
    const [inputLogin, setInputLogin] = useState({ email: "", password: "" });
    const [formRegister, setFormRegister] = useState(false);
    const [formOtp, setFormOtp] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const otpInputs = useRef([]);
    const dispatch = useDispatch();

    const changePage = () => {
        setFormRegister(!formRegister);
    };

    const handleChangeLogin = (name, text) => {
        setInputLogin((input) => ({ ...input, [name]: text }));
    };

    const handleChangeRegister = (name, text) => {
        setInputRegister((input) => ({ ...input, [name]: text }));
    };

    const handleOtpChange = (index, value) => {
        if (/^[0-9]$/.test(value) || value === "") {
            const updatedOtp = [...otp];
            updatedOtp[index] = value;
            setOtp(updatedOtp);

            if (index > 0 && value === "") {
                otpInputs.current[index - 1].focus();
            } else if (index < 3 && value !== "") {
                otpInputs.current[index + 1].focus();
            }
        }
    };

    const getOtp = () => {
        setLoading(true);
        dispatch(createOtp(inputLogin))
            .then(() => {
                setOtp(["", "", "", ""]);
                setErrMsg("");
                setFormOtp(true);
            })
            .catch((err) => errorAlert(err))
            .finally(() => setLoading(false));
    };

    const submitRegister = () => {
        setLoading(true);
        dispatch(registerHandler(inputRegister))
            .then((data) => {
                successAlert(data.message);
                setInputRegister({ fullName: "", email: "", password: "", phone: "" });
                setFormRegister(false);
            })
            .catch((err) => errorAlert(err))
            .finally(() => setLoading(false));
    };

    const submitOtp = () => {
        dispatch(handleLogin({ ...inputLogin, otp: otp.join("") }))
            .then(async (data) => {
                await AsyncStorage.setItem("access_token", data.access_token);
                setFormOtp(false);
                dispatch(getUser());
                successAlert("Welcome to Settle");
                navigation.navigate("home", { screen: "Home" });
            })
            .catch((error) => setErrMsg(getErrorMessage(error)));
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.header}>
                <Text style={styles.logo}>Settle</Text>
                <Text style={styles.headerText}>{formRegister ? "Create your account" : "Welcome back"}</Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.formContainer}>
                <ScrollView contentContainerStyle={{ gap: 15 }} keyboardShouldPersistTaps="handled">
                    {formRegister ? (
                        <>
                            <View style={styles.field}>
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput placeholder="Your full name" style={styles.textInput} value={inputRegister.fullName} onChangeText={(text) => handleChangeRegister("fullName", text)} />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.textInput} value={inputRegister.email} onChangeText={(text) => handleChangeRegister("email", text)} />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput placeholder="At least 8 characters" secureTextEntry={true} style={styles.textInput} value={inputRegister.password} onChangeText={(text) => handleChangeRegister("password", text)} />
                                <Text style={styles.hint}>Must include 1 capital letter, 1 number and 1 special character</Text>
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Phone Number</Text>
                                <TextInput placeholder="04XX XXX XXX" keyboardType="phone-pad" style={styles.textInput} value={inputRegister.phone} onChangeText={(text) => handleChangeRegister("phone", text)} />
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.field}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" style={styles.textInput} value={inputLogin.email} onChangeText={(text) => handleChangeLogin("email", text)} />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Password</Text>
                                <TextInput placeholder="Your password" secureTextEntry={true} style={styles.textInput} value={inputLogin.password} onChangeText={(text) => handleChangeLogin("password", text)} />
                            </View>
                        </>
                    )}

                    {loading && <ActivityIndicator size="large" color={colors.primary} />}

                    <Pressable style={styles.buttonAction} onPress={formRegister ? submitRegister : getOtp} disabled={loading}>
                        <Text style={styles.textAction}>{formRegister ? "Register" : "Log In"}</Text>
                    </Pressable>

                    <View style={styles.actionContainer}>
                        <Text>{formRegister ? "Already have an account? " : "Don't have an account? "}</Text>
                        <Pressable onPress={changePage}>
                            <Text style={styles.link}>{formRegister ? "Log in" : "Register now"}</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* OTP modal */}
            <Modal visible={formOtp} transparent animationType="fade" onRequestClose={() => setFormOtp(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.otpContainer}>
                        <Pressable style={styles.closeButton} onPress={() => setFormOtp(false)}>
                            <MaterialIcons name="close" size={26} color={colors.grey} />
                        </Pressable>
                        <Text style={styles.otpText}>Enter the 4-digit code we emailed you</Text>
                        {errMsg ? <Text style={styles.errorText}>{errMsg}</Text> : null}
                        <View style={styles.otpView}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(index, value)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    ref={(ref) => (otpInputs.current[index] = ref)}
                                />
                            ))}
                        </View>
                        <Pressable style={[styles.buttonAction, { alignSelf: "stretch" }]} onPress={submitOtp}>
                            <Text style={styles.textAction}>Submit</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    header: {
        height: 200,
        justifyContent: "flex-end",
        padding: 24,
    },
    logo: {
        fontSize: 36,
        fontWeight: "800",
        color: colors.white,
    },
    headerText: {
        marginTop: 4,
        fontSize: 16,
        color: colors.primaryLight,
    },
    formContainer: {
        flex: 1,
        backgroundColor: colors.background,
        borderTopStartRadius: 24,
        borderTopEndRadius: 24,
        padding: 24,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: colors.dark,
    },
    hint: {
        fontSize: 13,
        color: colors.grey,
    },
    textInput: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#DDE5E2",
    },
    buttonAction: {
        marginTop: 10,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
        backgroundColor: colors.primary,
    },
    textAction: {
        color: colors.white,
        fontWeight: "700",
        fontSize: 16,
    },
    actionContainer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    link: {
        color: colors.primary,
        fontWeight: "700",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        padding: 20,
    },
    otpContainer: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        paddingTop: 40,
        alignItems: "center",
        gap: 16,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    otpText: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.dark,
        textAlign: "center",
    },
    errorText: {
        color: colors.danger,
    },
    otpView: {
        flexDirection: "row",
        gap: 12,
    },
    otpInput: {
        width: 54,
        height: 54,
        borderWidth: 1,
        borderColor: "#DDE5E2",
        borderRadius: 12,
        textAlign: "center",
        fontSize: 22,
    },
});

export default LoginRegister;