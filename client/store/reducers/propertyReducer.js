import {
    PROPERTY_FETCH_REQUEST,
    PROPERTY_FETCH_SUCCESS,
    PROPERTY_FETCH_FAIL,
    TRENDING_FETCH_SUCCESS,
    PROPERTY_DETAIL_FETCH_REQUEST,
    PROPERTY_DETAIL_FETCH_SUCCESS,
    LOCATIONS_FETCH_SUCCESS,
    SEARCH_FETCH_SUCCESS,
    MY_PROPERTIES_FETCH_SUCCESS,
} from "../actions/actionType";

// properties = Home, trending = Trending row, detail = the place page,
// locations = Explore's suburb cards, searchResults = Explore's search, myProperties = My places
const initialState = {
    properties: [],
    trending: [],
    detail: null,
    loading: false,
    locations: [],
    searchResults: [],
    myProperties: [],
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
        // Clear the old place so the page doesn't show the last one while loading
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
        case MY_PROPERTIES_FETCH_SUCCESS:
            return {
                ...state,
                myProperties: action.payload,
            };
        default:
            return state;
    }
};

export default propertyReducer;