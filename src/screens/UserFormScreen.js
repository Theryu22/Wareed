import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { UserContext } from "../context/UserContext";
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, set } from "firebase/database"; // تأكد من أنك تستورد set و ref لحفظ البيانات
import { database, auth } from '../firebaseConfig'; // تأكد من استيراد قاعدة البيانات بشكل صحيح

export default function UserFormScreen({ navigation }) {
  const { setUserName, setBloodType, setAge } = useContext(UserContext);
  const [name, setName] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState(null);
  const [age, setAgeInput] = useState("18");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Arabic validation messages
    if (!name.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال الاسم الكامل");
      setIsSubmitting(false);
      return;
    }

    if (!selectedBloodType) {
      Alert.alert("خطأ", "الرجاء اختيار فصيلة الدم");
      setIsSubmitting(false);
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      Alert.alert("خطأ", "الرجاء إدخال عمر صحيح");
      setIsSubmitting(false);
      return;
    }

    if (ageNum < 18 || ageNum > 100) {
      Alert.alert("خطأ", "يجب أن يكون العمر بين ١٨ و ١٠٠ سنة");
      setIsSubmitting(false);
      return;
    }

    // Set user data to context
    setUserName(name.trim());
    setBloodType(selectedBloodType);
    setAge(ageNum.toString());

    // Save user data to Firebase Realtime Database
    try {
      const userId = auth.currentUser.uid; // الحصول على ال UID الخاص بالمستخدم
      const userRef = ref(database, 'Info/' + userId);

      // استخدام set لتخزين البيانات في قاعدة البيانات
      await set(userRef, {
        name: name.trim(),
        bloodType: selectedBloodType,
        age: ageNum.toString(),
      });

      setIsSubmitting(false);

      // Arabic success message
      Alert.alert(
        "تم بنجاح",
        "تم حفظ معلوماتك بنجاح",
        [
          {
            text: "تم",
            onPress: () => navigation.replace("MainApp") // توجيه المستخدم إلى الصفحة الرئيسية
          }
        ]
      );
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ البيانات. حاول مرة أخرى.");
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.header}>المعلومات الشخصية</Text>
          <Text style={styles.subHeader}>الرجاء إدخال معلوماتك للمتابعة</Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الاسم الكامل</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="أدخل اسمك الكامل"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              textAlign="right"
            />
            <Ionicons name="person-outline" size={22} color="#666" style={styles.inputIcon} />
          </View>
        </View>

        {/* Age Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>العمر</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={age}
              style={styles.picker}
              onValueChange={(itemValue) => setAgeInput(itemValue.toString())}
              mode="dropdown"
              itemStyle={styles.pickerItem}
            >
              {[...Array(83).keys()].map((num) => (
                <Picker.Item 
                  label={`${num + 18} سنة`} 
                  value={(num + 18).toString()} 
                  key={num} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Blood Type Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>فصيلة الدم</Text>
          <View style={styles.bloodTypeContainer}>
            {bloodTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.bloodTypeButton, selectedBloodType === type && styles.selectedBloodType]}
                onPress={() => setSelectedBloodType(type)}
                activeOpacity={0.7}
              >
                <Text style={[styles.bloodTypeText, selectedBloodType === type && styles.selectedBloodTypeText]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ المعلومات"}
          </Text>
          {isSubmitting && (
            <ActivityIndicator color="#fff" style={styles.loadingIndicator} />
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    padding: 25,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'flex-end',
    paddingTop: 80,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    textAlign: "right",
    marginBottom: 8,
    fontFamily: 'sans-serif',
  },
  subHeader: {
    fontSize: 16,
    color: "#666",
    textAlign: "right",
    fontFamily: 'sans-serif',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    marginBottom: 10,
    marginRight: 5,
    textAlign: "right",
    fontFamily: 'sans-serif',
  },
  inputWrapper: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  inputIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    fontFamily: 'sans-serif',
    paddingVertical: 0, // Fix for Android text alignment
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 150,
  },
  pickerItem: {
    textAlign: "right",
    fontFamily: 'sans-serif',
  },
  bloodTypeContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    
  },
  bloodTypeButton: {
    width: "22%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 15,
    marginLeft: 10,
  },
  selectedBloodType: {
    backgroundColor: "#075eec",
  },
  bloodTypeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    fontFamily: 'sans-serif',
  },
  selectedBloodTypeText: {
    color: "#fff",
  },
  submitButton: {
    backgroundColor: "#075eec",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -25,
    shadowColor: "#075eec",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row-reverse",
    
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: 'sans-serif',
  },
  loadingIndicator: {
    marginRight: 10,
  },
});
