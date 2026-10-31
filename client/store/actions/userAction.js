import { PROFILES_FETCH_REQUEST, PROFILES_FETCH_SUCCESS, PROFILES_FETCH_FAIL, LOGOUT_SUCCESS } from "./actionType";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { successAlert, getErrorMessage } from "../../src/helpers/alert";
import { baseUrl } from "./baseUrl";

// Sign up. Errors get thrown as a readable message so the screen can show it
export const registerHandler = (value) => {
    return async () => {
        try {
            const { data } = await axios({
                url: baseUrl + "/register",
                method: "POST",
                data: value,
            });
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// Login step 1: checks email + password and emails the code
export const createOtp = (value) => {
    return async () => {
        try {
            const { data } = await axios({
                url: baseUrl + "/otp",
                method: "POST",
                data: value,
            });
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// Login step 2: sends the code and gets back the access_token
export const handleLogin = (value) => {
    return async () => {
        try {
            const { data } = await axios({
                url: baseUrl + "/login",
                method: "POST",
                data: value,
            });
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// FETCH PROFILE
// Loads my account, but only if a token is saved on the phone (I'm logged in)
export const getUser = () => {
    return async (dispatch) => {
        const access_token = await AsyncStorage.getItem("access_token");
        if (access_token) {
            dispatch(fetchProfile(access_token));
        }
    };
};

export const profilesFetchRequest = () => {
    return { type: PROFILES_FETCH_REQUEST };
};

export const profilesFetchSuccess = (payload) => {
    return { type: PROFILES_FETCH_SUCCESS, payload };
};

export const profilesFetchFail = () => {
    return { type: PROFILES_FETCH_FAIL };
};

// GET /profiles with the token, then puts my account in the store
export const fetchProfile = (access_token) => {
    return async (dispatch) => {
        dispatch(profilesFetchRequest());
        try {
            const { data } = await axios({
                url: baseUrl + "/profiles",
                method: "GET",
                headers: {
                    access_token,
                },
            });
            dispatch(profilesFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
            dispatch(profilesFetchFail());
        }
    };
};

// Forget the token and clear my account from the store
export const handleLogout = () => {
    return async (dispatch) => {
        await AsyncStorage.removeItem("access_token");
        dispatch({ type: LOGOUT_SUCCESS });
        successAlert("Success Logout");
    };
};

// PROFILE PHOTO AND ID CARD
// Uploads the profile photo + ID (FormData), then reloads my account
export const addProfile = (value) => {
    return async (dispatch) => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/profiles",
                method: "POST",
                data: value,
                headers: {
                    access_token,
                },
            });
            dispatch(getUser());
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// Same, but replaces the old photos
export const editProfile = (value) => {
    return async (dispatch) => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/profiles",
                method: "PUT",
                data: value,
                headers: {
                    access_token,
                },
            });
            dispatch(getUser());
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};