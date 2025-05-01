import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, I18nManager } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from "../context/UserContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, deleteUser } from "firebase/auth"; // استيراد دالة حذف الحساب

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { setLanguage: setAppLanguage } = useContext(UserContext);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(I18nManager.isRTL ? "العربية" : "English");

  // Toggle Notifications
  const toggleNotifications = () => setIsNotificationsEnabled(previousState => !previousState);

  // Handle Language Change
  const changeLanguage = async () => {
    const newLanguage = currentLanguage === "العربية" ? "English" : "العربية";
    
    try {
      // Save language preference
      await AsyncStorage.setItem('appLanguage', newLanguage === "العربية" ? "ar" : "en");
      
      // Update context
      setAppLanguage(newLanguage === "العربية" ? "ar" : "en");
      
      // Update local state
      setCurrentLanguage(newLanguage);
      
      // Force RTL/LTR layout change
      if (newLanguage === "العربية") {
        I18nManager.forceRTL(true);
      } else {
        I18nManager.forceRTL(false);
      }
      
      Alert.alert(
        "تم تغيير اللغة",
        "سيتم تطبيق تغيير اللغة بعد إعادة تشغيل التطبيق",
        [{ text: "حسناً" }]
      );
    } catch (error) {
      console.error("Error saving language preference:", error);
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    Alert.alert(
      "تسجيل الخروج", 
      "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      [
        { 
          text: "إلغاء",
          style: "cancel" 
        },
        { 
          text: "تسجيل الخروج", 
          onPress: () => navigation.replace('SignIn'),
          style: "destructive" 
        },
      ]
    );
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    Alert.alert(
      "حذف الحساب", 
      "هل أنت متأكد أنك تريد حذف حسابك؟ سيتم حذف جميع بياناتك بشكل دائم.",
      [
        { 
          text: "إلغاء",
          style: "cancel" 
        },
        { 
          text: "حذف الحساب", 
          onPress: async () => await deleteAccount(),
          style: "destructive" 
        },
      ]
    );
  };

  // Function to delete user account
  const deleteAccount = async () => {
    const auth = getAuth(); // Get current user authentication
    const user = auth.currentUser; // Get current signed-in user

    if (user) {
      try {
        // Delete the user
        await deleteUser(user);
        Alert.alert("تم حذف الحساب", "تم حذف حسابك بنجاح.");
        // Redirect to SignIn page after deletion
        navigation.replace('SignIn');
      } catch (error) {
        Alert.alert("خطأ", "تعذر حذف الحساب. الرجاء المحاولة لاحقاً.");
        console.error("Error deleting user:", error);
      }
    } else {
      Alert.alert("خطأ", "لم يتم العثور على المستخدم الحالي.");
    }
  };

  return (
    <View style={[styles.container, { direction: currentLanguage === "العربية" ? 'rtl' : 'ltr' }]}>
      <Text style={styles.header}>الإعدادات</Text>

      {/* Settings List */}
      <View style={styles.settingsList}>
        {/* Notifications Toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={22} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingText}>الإشعارات</Text>
          </View>
          <Switch
            trackColor={{ false: "#ccc", true: "#075eec" }}
            thumbColor={isNotificationsEnabled ? "#fff" : "#fff"}
            value={isNotificationsEnabled}
            onValueChange={toggleNotifications}
          />
        </View>

        {/* Language Change Option */}
        <TouchableOpacity onPress={changeLanguage} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="language" size={22} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingText}>تغيير اللغة</Text>
          </View>
          <View style={styles.languageContainer}>
            <Text style={styles.languageText}>{currentLanguage}</Text>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </View>
        </TouchableOpacity>

        {/* About Us */}
        <TouchableOpacity onPress={() => navigation.navigate('AboutUs')} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="information-circle" size={22} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingText}>عن التطبيق</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')} style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed" size={22} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingText}>سياسة الخصوصية</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.actionsContainer}>
        {/* Delete Account */}
        <TouchableOpacity 
          onPress={handleDeleteAccount} 
          style={[styles.actionButton, styles.deleteButton]}
        >
          <Ionicons name="trash" size={20} color="#f44336" />
          <Text style={[styles.actionButtonText, { color: '#f44336' }]}>حذف الحساب</Text>
        </TouchableOpacity>

        {/* Sign Out */}
        <TouchableOpacity 
          onPress={handleSignOut} 
          style={[styles.actionButton, styles.signOutButton]}
        >
          <Ionicons name="log-out" size={20} color="#075eec" />
          <Text style={[styles.actionButtonText, { color: '#075eec' }]}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>وريد - الإصدار 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "right",
    color: "#333",
  },
  settingsList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginLeft: 10,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
  },
  languageContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    fontSize: 14,
    color: "#888",
    marginLeft: 5,
  },
  actionsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: "rgba(7, 94, 236, 0.1)",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  versionText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginTop: 10,
  },
});
