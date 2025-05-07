import React, { useState, useEffect, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import UserFormScreen from './src/screens/UserFormScreen';
import GoogleMapScreen from './src/screens/GoogleMapScreen';
import DonateScreen from './src/screens/DonateScreen';
import UrgencyDetailsScreen from './src/screens/UrgencyDetailsScreen';
import DonationsScreen from './src/screens/DonationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ContactUsScreen from './src/screens/ContactUsScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminUsersScreen from './src/screens/AdminUsersScreen';
import AdminDonationsScreen from './src/screens/AdminDonationsScreen';


// Components
import CustomDrawerContent from './src/components/CustomDrawerContent';
import AdminDrawerContent from './src/components/AdminDrawerContent';

// Context
import { UserProvider } from './src/context/UserContext';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#075eec" />
  </View>
);

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

function AdminNavigator() {
  return (
    <Drawer.Navigator
    drawerContent={(props) => <AdminDrawerContent {...props} />}
    screenOptions={{ drawerPosition: "right", drawerType: "back" }}
    >
      <Drawer.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
      <Drawer.Screen name="AdminUsersScreen" component={AdminUsersScreen} />
      <Drawer.Screen name="AdminDonationsScreen" component={AdminDonationsScreen} />
    </Drawer.Navigator>
  );
} 

function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="UserForm" component={UserFormScreen} />
          <Stack.Screen name="MainApp" component={MainApp} />
          <Stack.Screen name="Admin" component={AdminNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;