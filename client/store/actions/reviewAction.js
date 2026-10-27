import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FETCH_REVIEW_BY_PROPERTY_SUCCESS, FETCH_REVIEW_BY_USER_SUCCESS } from "./actionType";
import { getErrorMessage } from "../../src/helpers/alert";
import { baseUrl } from "./baseUrl";

export const reviewByPropertyFetchSuccess = (payload) => {
    return { type: FETCH_REVIEW_BY_PROPERTY_SUCCESS, payload };
};

export const fetchReviewByProperty = (id) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.get(baseUrl + "/reviews/" + id);
            dispatch(reviewByPropertyFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
        }
    };
};

// MY REVIEWS
export const reviewByUserFetchSuccess = (payload) => {
    return { type: FETCH_REVIEW_BY_USER_SUCCESS, payload };
};

export const fetchReviewByUser = () => {
    return async (dispatch) => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/reviews",
                method: "GET",
                headers: {
                    access_token,
                },
            });
            dispatch(reviewByUserFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
        }
    };
};

// POST REVIEW
export const addReview = (value, id) => {
    return async (dispatch) => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/reviews/" + id,
                method: "POST",
                data: value,
                headers: {
                    access_token,
                },
            });
            dispatch(fetchReviewByProperty(id));
            dispatch(fetchReviewByUser());
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};