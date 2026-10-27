import { useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Provider, useDispatch, useSelector } from "react-redux";
import { AlertNotificationRoot } from "react-native-alert-notification";
import store from "./store/reducers";
import { getUser } from "./store/actions";
import { colors } from "./src/theme";
import Splash from "./src/screens/Splash";
import Home from "./src/screens/Home";
import Account from "./src/screens/Account";
import LoginRegister from "./src/screens/LoginRegister";
import Detail from "./src/screens/Detail";
import Explore from "./src/screens/Explore";
import Bookings from "./src/screens/Bookings";
import BookingDetail from "./src/screens/BookingDetail";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTab = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.userReducer);

  useFocusEffect(
    useCallback(() => {
      dispatch(getUser());
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grey,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "You") {
            iconName = focused ? "person-circle" : "person-circle-outline";
          } else if (route.name === "Explore") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Bookings") {
            iconName = focused ? "calendar" : "calendar-outline";
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Bookings" component={Bookings} />
      {profile ? <Tab.Screen name="You" component={Account} /> : <Tab.Screen name="You" component={LoginRegister} />}
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AlertNotificationRoot theme="light">
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="splash" component={Splash} />
            <Stack.Screen name="home" component={HomeTab} />
            <Stack.Screen name="loginRegister" component={LoginRegister} />
            <Stack.Screen
              name="detail"
              component={Detail}
              options={({ route }) => ({
                headerShown: true,
                title: route.params.name,
                headerTintColor: colors.primary,
                headerBackTitle: "Back",
              })}
            />
            <Stack.Screen
              name="bookingDetail"
              component={BookingDetail}
              options={{
                headerShown: true,
                title: "Booking",
                headerTintColor: colors.primary,
                headerBackTitle: "Back",
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </AlertNotificationRoot>
    </Provider>
  );
}