import {
    PROPERTY_FETCH_REQUEST,
    PROPERTY_FETCH_SUCCESS,
    PROPERTY_FETCH_FAIL,
    TRENDING_FETCH_SUCCESS,
    PROPERTY_DETAIL_FETCH_REQUEST,
    PROPERTY_DETAIL_FETCH_SUCCESS,
    LOCATIONS_FETCH_SUCCESS,
    SEARCH_FETCH_SUCCESS
} from "../actions/actionType";
const initialState = {
    properties: [],
    trending: [],
    detail: null,
    loading: false,
    locations: [],
    searchResults: [],
};

const propertyReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROPERTY_FETCH_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case PROPERTY_FETCH_SUCCESS:
            return {
                ...state,
                properties: action.payload,
                loading: false,
            };
        case PROPERTY_FETCH_FAIL:
            return {
                ...state,
                properties: [],
                loading: false,
            };
        case TRENDING_FETCH_SUCCESS:
            return {
                ...state,
                trending: action.payload,
            };
        case PROPERTY_DETAIL_FETCH_REQUEST:
            return {
                ...state,
                detail: null,
            };
        case PROPERTY_DETAIL_FETCH_SUCCESS:
            return {
                ...state,
                detail: action.payload,
            };
        case LOCATIONS_FETCH_SUCCESS:
            return {
                ...state,
                locations: action.payload,
            };
        case SEARCH_FETCH_SUCCESS:
            return {
                ...state,
                searchResults: action.payload,
            };
        default:
            return state;
    }
};

export default propertyReducer;