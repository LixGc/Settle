import { FETCH_REVIEW_BY_PROPERTY_SUCCESS } from "../actions/actionType";

const initialState = {
    propertyReviews: [],
};

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_REVIEW_BY_PROPERTY_SUCCESS:
            return {
                ...state,
                propertyReviews: action.payload,
            };
        default:
            return state;
    }
};

export default reviewReducer;