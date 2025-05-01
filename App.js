import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import GoogleMapScreen from "./src/screens/GoogleMapScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import UserFormScreen from "./src/screens/UserFormScreen";
import DonateScreen from "./src/screens/DonateScreen"; // Example screen
import UrgencyDetailsScreen from "./src/screens/UrgencyDetailsScreen"; // Example screen
import DonationsScreen from "./src/screens/DonationsScreen"; // Example screen
import ProfileScreen from "./src/screens/ProfileScreen"; // Example screen
import SettingsScreen from "./src/screens/SettingsScreen"; // Example screen
import ContactUsScreen from "./src/screens/ContactUsScreen"; // Example screen
import CustomDrawerContent from "./src/components/CustomDrawerContent";
import { UserProvider } from "./src/context/UserContext"; // Import User Context

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function MainApp() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ drawerPosition: "right", drawerType: "back" }}
    >
      <Drawer.Screen name="GoogleMapScreen" component={GoogleMapScreen} />
      <Drawer.Screen name="DonateScreen" component={DonateScreen} />
      <Drawer.Screen name="UrgencyDetailsScreen" component={UrgencyDetailsScreen} />
      <Drawer.Screen name="DonationsScreen" component={DonationsScreen} />
      <Drawer.Screen name="ProfileScreen" component={ProfileScreen} />
      <Drawer.Screen name="SettingsScreen" component={SettingsScreen} />
      <Drawer.Screen name="ContactUsScreen" component={ContactUsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="UserForm" component={UserFormScreen} />
          <Stack.Screen name="MainApp" component={MainApp} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}