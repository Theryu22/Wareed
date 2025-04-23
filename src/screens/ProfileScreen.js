import React, { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { UserContext } from "../context/UserContext";
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen({ navigation }) {
  const { userName, bloodType, age, setAge } = useContext(UserContext);
  const [editableAge, setEditableAge] = useState(age);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setAge(editableAge);
    setIsEditing(false);
    Alert.alert("تم الحفظ", "تم تحديث بياناتك بنجاح");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#075eec" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={[styles.bloodTypeBadge, {backgroundColor: getBloodTypeColor(bloodType)}]}>
              <Text style={styles.bloodTypeText}>{bloodType}</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
          </View>

          {/* User Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#555" />
              <Text style={styles.infoLabel}>الاسم:</Text>
              <Text style={styles.infoValue}>{userName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="water" size={20} color="#555" />
              <Text style={styles.infoLabel}>فصيلة الدم:</Text>
              <Text style={styles.infoValue}>{bloodType}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#555" />
              <Text style={styles.infoLabel}>العمر:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.ageInput}
                  value={editableAge}
                  onChangeText={setEditableAge}
                  keyboardType="numeric"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoValue}>{age}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>حفظ التغييرات</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.buttonText}>إلغاء</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>تعديل البيانات</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Additional Options */}
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => navigation.navigate('UserForm')}
        >
          <Text style={styles.optionButtonText}>تحديث معلوماتي الأساسية</Text>
          <Ionicons name="chevron-forward" size={20} color="#075eec" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getBloodTypeColor = (bloodType) => {
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
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 25,
  },
  bloodTypeBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  bloodTypeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 10,
    width: 100,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  ageInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'right',
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#075eec',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 18,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  optionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});