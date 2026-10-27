import { PROFILES_FETCH_REQUEST, PROFILES_FETCH_SUCCESS, PROFILES_FETCH_FAIL, LOGOUT_SUCCESS } from "./actionType";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { successAlert, getErrorMessage } from "../../src/helpers/alert";
import { baseUrl } from "./baseUrl";

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

export const handleLogout = () => {
    return async (dispatch) => {
        await AsyncStorage.removeItem("access_token");
        dispatch({ type: LOGOUT_SUCCESS });
        successAlert("Success Logout");
    };
};

// PROFILE PHOTO AND ID CARD
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