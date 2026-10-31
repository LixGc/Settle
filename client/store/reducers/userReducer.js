import { PROFILES_FETCH_REQUEST, PROFILES_FETCH_SUCCESS, PROFILES_FETCH_FAIL, LOGOUT_SUCCESS } from "../actions/actionType";

// profile = the logged in user, null when logged out
const initialState = {
    loading: false,
    profile: null,
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case PROFILES_FETCH_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case PROFILES_FETCH_SUCCESS:
            return {
                ...state,
                profile: action.payload,
                loading: false,
            };
        case PROFILES_FETCH_FAIL:
            return {
                ...state,
                loading: false,
            };
        // Back to empty when logging out
        case LOGOUT_SUCCESS:
            return initialState;
        default:
            return state;
    }
};

export default userReducer;