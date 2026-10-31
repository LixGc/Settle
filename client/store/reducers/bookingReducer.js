import { BOOKING_DETAIL_FETCH_REQUEST, BOOKING_DETAIL_FETCH_SUCCESS, PROPERTY_BOOKINGS_FETCH_SUCCESS, OWNER_BOOKINGS_FETCH_SUCCESS } from "../actions/actionType";

// booking = the one that's open, propertyBookings = a place's booked dates, ownerBookings = Guest bookings
const initialState = {
    booking: null,
    propertyBookings: [],
    ownerBookings: [],
};

const bookingReducer = (state = initialState, action) => {
    switch (action.type) {
        // Clear the old booking so the screen doesn't flash the last one
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
        case OWNER_BOOKINGS_FETCH_SUCCESS:
            return {
                ...state,
                ownerBookings: action.payload,
            };
        default:
            return state;
    }
};

export default bookingReducer;