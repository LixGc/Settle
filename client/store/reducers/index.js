import { combineReducers, legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import userReducer from "./userReducer";
import propertyReducer from "./propertyReducer";
import categoryReducer from "./categoryReducer";
import reviewReducer from "./reviewReducer";
import bookingReducer from "./bookingReducer";

const rootReducer = combineReducers({
    userReducer,
    propertyReducer,
    categoryReducer,
    reviewReducer,
    bookingReducer,
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;