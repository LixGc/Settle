import axios from "axios";
import {
    PROPERTY_FETCH_REQUEST,
    PROPERTY_FETCH_SUCCESS,
    PROPERTY_FETCH_FAIL,
    TRENDING_FETCH_SUCCESS,
    PROPERTY_DETAIL_FETCH_REQUEST,
    PROPERTY_DETAIL_FETCH_SUCCESS,
    CATEGORIES_FETCH_SUCCESS,
} from "./actionType";
import { getErrorMessage } from "../../src/helpers/alert";
import { baseUrl } from "./baseUrl";

// FETCH PROPERTIES
export const propertyFetchRequest = () => {
    return { type: PROPERTY_FETCH_REQUEST };
};

export const propertyFetchSuccess = (payload) => {
    return { type: PROPERTY_FETCH_SUCCESS, payload };
};

export const propertyFetchFail = () => {
    return { type: PROPERTY_FETCH_FAIL };
};

export const fetchProperties = () => {
    return async (dispatch) => {
        dispatch(propertyFetchRequest());
        try {
            const { data } = await axios.get(baseUrl + "/properties");
            dispatch(propertyFetchSuccess(data));
        } catch (error) {
            // The server answers "Not Found" when there are no properties yet
            dispatch(propertyFetchFail());
        }
    };
};

// TRENDING
export const trendingFetchSuccess = (payload) => {
    return { type: TRENDING_FETCH_SUCCESS, payload };
};

export const fetchTrending = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios.get(baseUrl + "/trending");
            dispatch(trendingFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
        }
    };
};

// PROPERTY DETAIL
export const detailFetchRequest = () => {
    return { type: PROPERTY_DETAIL_FETCH_REQUEST };
};

export const detailFetchSuccess = (payload) => {
    return { type: PROPERTY_DETAIL_FETCH_SUCCESS, payload };
};

export const fetchDetail = (id) => {
    return async (dispatch) => {
        dispatch(detailFetchRequest());
        try {
            const { data } = await axios.get(baseUrl + "/properties/" + id);
            dispatch(detailFetchSuccess(data));
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// CATEGORIES
export const categoriesFetchSuccess = (payload) => {
    return { type: CATEGORIES_FETCH_SUCCESS, payload };
};

export const fetchCategories = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios.get(baseUrl + "/categories");
            dispatch(categoriesFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
        }
    };
};