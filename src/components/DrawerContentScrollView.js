import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import CustomDrawerContent from "./CustomDrawerContent"; // Your custom drawer component

import ProfileScreen from "./ProfileScreen";
import DonationsScreen from "./DonationsScreen";
import SettingsScreen from "./SettingsScreen";
import ContactScreen from "./ContactScreen";

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerPosition: "right", // Set drawer to open from the right
          drawerType: "slide", // Smooth slide animation
          overlayColor: "rgba(0, 0, 0, 0.5)", // Dim background when open
        }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Donations" component={DonationsScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Contact" component={ContactScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
