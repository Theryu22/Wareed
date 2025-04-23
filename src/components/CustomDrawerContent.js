import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { UserContext } from "../context/UserContext";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function CustomDrawerContent({ navigation }) {
  const { userName, bloodType } = useContext(UserContext);

  const menuItems = [
    { name: "تبرع الآن", icon: "water", screen: "DonateScreen" },
    { name: "صفحتي", icon: "person", screen: "ProfileScreen" },
    { name: "سجل التبرعات", icon: "list", screen: "DonationsScreen" },
    { name: "الإعدادات", icon: "settings", screen: "SettingsScreen" },
    { name: "تواصل معنا", icon: "chatbubbles", screen: "ContactUsScreen" },
  ];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={require('../pic/app-logo.avif')}
          style={styles.logo}
        />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Ionicons 
            name="person-circle" 
            size={70} 
            color={userName ? "#075eec" : "#999"}
            style={styles.profileIcon}
          />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{userName || "زائر"}</Text>
          {bloodType && (
            <View style={[styles.bloodTypeBadge, {backgroundColor: getBloodColor(bloodType)}]}>
              <Text style={styles.bloodTypeText}>{bloodType}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={22} color="#075eec" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>تطبيق تبرع بالدم</Text>
        <Text style={styles.footerText}>الإصدار 1.0.0</Text>
      </View>
    </View>
  );
}

const getBloodColor = (bloodType) => {
  const colors = {
    'O+': '#f44336',
    'A+': '#4caf50',
    'B+': '#2196f3',
    'AB+': '#9c27b0',
    'O-': '#ff9800',
    'A-': '#009688',
    'B-': '#3f51b5',
    'AB-': '#e91e63'
  };
  return colors[bloodType] || '#607d8b';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logo: {
    width: 180,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  profileSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#075eec',
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  bloodTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bloodTypeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 3,
  },
  menuIcon: {
    marginLeft: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
    marginVertical: 2,
  },
});