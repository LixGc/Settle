import { FETCH_REVIEW_BY_PROPERTY_SUCCESS, FETCH_REVIEW_BY_USER_SUCCESS } from "../actions/actionType";

const initialState = {
    propertyReviews: [],
    userReviews: [],
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
        default:
            return state;
    }
};

export default reviewReducer;