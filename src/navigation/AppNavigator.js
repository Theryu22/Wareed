import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./StackNavigator";
import CustomDrawerContent from "../components/CustomDrawerContent";

const Drawer = createDrawerNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="HomeStack"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerPosition: "right",
          drawerType: "slide",
          overlayColor: "rgba(65, 13, 13, 0.5)",
          headerShown: false, // This hides the header for all screens in the drawer
          swipeEnabled: true, // Enable swipe gesture to open drawer
          drawerStyle: {
            width: '75%', // Adjust drawer width as needed
            backgroundColor: '#fff', // Customize drawer background
          },
        }}
      >
        <Drawer.Screen 
          name="HomeStack" 
          component={StackNavigator} 
          options={{
            headerShown: false, // Redundant but ensures no header
            drawerLabel: () => null, // Hide label in drawer
            drawerIcon: () => null, // Hide icon in drawer
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}