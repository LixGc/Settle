import { combineReducers, legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./userReducer";
import propertyReducer from "./propertyReducer";
import categoryReducer from "./categoryReducer";
import reviewReducer from "./reviewReducer";
import bookingReducer from "./bookingReducer";

// All the reducers together, each one looks after its own part of the state
const rootReducer = combineReducers({
    userReducer,
    propertyReducer,
    categoryReducer,
    reviewReducer,
    bookingReducer,
});

// thunk lets actions be async (call the API, then dispatch)
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;