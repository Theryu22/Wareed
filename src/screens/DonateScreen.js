import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { UserContext } from "../context/UserContext";

export default function DonateScreen({ navigation }) {
  const { userName } = useContext(UserContext);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>حالات التبرع بالدم في حفر الباطن</Text>

      <Text style={styles.greeting}>مرحباً، {userName ? userName : "الزائر"}!</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'red' }]}
        onPress={() => navigation.navigate('UrgencyDetailsScreen', { urgency: 'عاجل جدًا' })}
      >
        <Text style={styles.buttonText}>عاجل جدًا</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'orange' }]}
        onPress={() => navigation.navigate('UrgencyDetailsScreen', { urgency: 'عاجل' })}
      >
        <Text style={styles.buttonText}>عاجل</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'green' }]}
        onPress={() => navigation.navigate('UrgencyDetailsScreen', { urgency: 'عادي' })}
      >
        <Text style={styles.buttonText}>عادي</Text>
      </TouchableOpacity>

      {/* Hint Section at the bottom */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          المنشئات الصحية الحكومية تفتح التبرعات من 8 صباحا حتى 4 مساءًا.{"\n"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  hintContainer: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  hintText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
});