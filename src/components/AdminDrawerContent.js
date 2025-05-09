import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';

export default function AdminDrawerContent({ navigation }) {
  const { userName } = useContext(UserContext);

  const adminMenuItems = [
    { name: "Dashboard", icon: "speedometer-outline", screen: "AdminDashboardScreen" },
  //  { name: "Main App", icon: "home-outline", screen: "MainApp" },
    // { name: "Manage Users", icon: "people-outline", screen: "AdminUsersScreen" },
   // { name: "Donation Requests", icon: "water-outline", screen: "AdminDonationsScreen" },
  ];

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "SignIn" }],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image
          source={require('../pic/Wareed_logoo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Admin Profile Section */}
      <View style={styles.profileSection}>
        <Ionicons name="shield-checkmark-outline" size={50} color="#075eec" />
        <Text style={styles.adminTitle}>Admin Panel</Text>
        <Text style={styles.username}>{userName || "Admin Account"}</Text>
      </View>

      {/* Simplified Menu */}
      <View style={styles.menuContainer}>
        {adminMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={22} color="#075eec" />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 50,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
    color: '#075eec'
  },
  username: {
    color: '#555',
  },
  menuContainer: {
    paddingTop: 20,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutText: {
    marginLeft: 10,
    color: '#e74c3c',
    fontWeight: '600',
  },
});
