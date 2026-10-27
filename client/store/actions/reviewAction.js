import axios from "axios";
import { FETCH_REVIEW_BY_PROPERTY_SUCCESS } from "./actionType";
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