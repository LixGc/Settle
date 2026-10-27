import { BOOKING_DETAIL_FETCH_REQUEST, BOOKING_DETAIL_FETCH_SUCCESS, PROPERTY_BOOKINGS_FETCH_SUCCESS } from "../actions/actionType";

const initialState = {
    booking: null,
    propertyBookings: [],
};

const bookingReducer = (state = initialState, action) => {
    switch (action.type) {
        case BOOKING_DETAIL_FETCH_REQUEST:
            return {
                ...state,
                booking: null,
            };
        case BOOKING_DETAIL_FETCH_SUCCESS:
            return {
                ...state,
                booking: action.payload,
            };
        case PROPERTY_BOOKINGS_FETCH_SUCCESS:
            return {
                ...state,
                propertyBookings: action.payload,
            };
        default:
            return state;
    }
};

export default bookingReducer;