import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BOOKING_DETAIL_FETCH_REQUEST, BOOKING_DETAIL_FETCH_SUCCESS, PROPERTY_BOOKINGS_FETCH_SUCCESS } from "./actionType";
import { getErrorMessage } from "../../src/helpers/alert";
import { getUser } from "./userAction";
import { baseUrl } from "./baseUrl";

// BOOKING DETAIL
export const bookingDetailFetchRequest = () => {
    return { type: BOOKING_DETAIL_FETCH_REQUEST };
};

export const bookingDetailFetchSuccess = (payload) => {
    return { type: BOOKING_DETAIL_FETCH_SUCCESS, payload };
};

export const fetchBookingById = (id) => {
    return async (dispatch) => {
        dispatch(bookingDetailFetchRequest());
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/bookings/" + id,
                method: "GET",
                headers: {
                    access_token,
                },
            });
            dispatch(bookingDetailFetchSuccess(data));
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// STRIPE PAYMENT
export const createPayment = (id) => {
    return async () => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/payments/" + id,
                method: "POST",
                headers: {
                    access_token,
                },
            });
            return data;
        } catch (error) {
            throw getErrorMessage(error);
        }
    };
};

// BOOKED DATES OF A PROPERTY
export const propertyBookingsFetchSuccess = (payload) => {
    return { type: PROPERTY_BOOKINGS_FETCH_SUCCESS, payload };
};

export const fetchPropertyBookings = (id) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.get(baseUrl + "/bookings/property/" + id);
            dispatch(propertyBookingsFetchSuccess(data));
        } catch (error) {
            console.log(getErrorMessage(error));
        }
    };
};

// CREATE BOOKING
export const createBooking = (value, id) => {
    return async (dispatch) => {
        try {
            const access_token = await AsyncStorage.getItem("access_token");
            const { data } = await axios({
                url: baseUrl + "/bookings/" + id,
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