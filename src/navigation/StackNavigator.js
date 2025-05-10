import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

// Import your screens
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import UserFormScreen from "../screens/UserFormScreen";
import GoogleMapScreen from "../screens/GoogleMapScreen";
import DonateScreen from "../screens/DonateScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import DonationsScreen from "../screens/DonationsScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import UrgencyDetailsScreen from "../screens/UrgencyDetailsScreen";
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import CaseManagementScreen from './src/screens/CaseManagementScreen';
import AdminDonationsScreen from './src/screens/AdminDonationsScreen';


const Stack = createStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // This hides the header for all screens
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
        cardShadowEnabled: false,
        headerMode: 'none', // Alternative way to hide header
      }}
    >
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ header: () => null }} // Additional safety
      />
       <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ header: () => null }} // Additional safety
      />
      <Stack.Screen 
        name="UserForm" 
        component={UserFormScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="AdminDashboardScreen" 
        component={AdminDashboardScreen} 
        options={{ header: () => null }} // Additional safety
      />
      <Stack.Screen 
        name="CaseManagementScreen" 
        component={CaseManagementScreen} 
        options={{ header: () => null }} // Additional safety
      />
      <Stack.Screen 
        name="AdminDonationsScreen" 
        component={AdminDonationsScreen} 
        options={{ header: () => null }} // Additional safety
      />
      <Stack.Screen 
        name="GoogleMap" 
        component={GoogleMapScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="Donate" 
        component={DonateScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="Donations" 
        component={DonationsScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="ContactUs" 
        component={ContactUsScreen} 
        options={{ header: () => null }}
      />
      <Stack.Screen 
        name="UrgencyDetails" 
        component={UrgencyDetailsScreen} 
        options={{ header: () => null }}
      />
    </Stack.Navigator>
  );
}