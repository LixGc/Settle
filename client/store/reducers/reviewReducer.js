import { FETCH_REVIEW_BY_PROPERTY_SUCCESS, FETCH_REVIEW_BY_USER_SUCCESS, FETCH_REVIEW_BY_OWNER_SUCCESS } from "../actions/actionType";

// Reviews of a place, reviews I wrote, and reviews of my places
const initialState = {
    propertyReviews: [],
    userReviews: [],
    ownerReviews: [],
};

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_REVIEW_BY_PROPERTY_SUCCESS:
            return {
                ...state,
                propertyReviews: action.payload,
            };
        case FETCH_REVIEW_BY_USER_SUCCESS:
            return {
                ...state,
                userReviews: action.payload,
            };
        case FETCH_REVIEW_BY_OWNER_SUCCESS:
            return {
                ...state,
                ownerReviews: action.payload,
            };
        default:
            return state;
    }
};

export default reviewReducer;