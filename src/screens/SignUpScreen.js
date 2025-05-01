// SignUpScreen.js
import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, // لازم يكون موجود معه البلاتفورم على اساس يشتغل
  Platform,
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebaseConfig'; // Import Firebase authentication
import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase Auth methods

export default function SignUpScreen() {
  const navigation = useNavigation();  // Set up navigation
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];
  const logoScaleAnim = useState(new Animated.Value(0.5))[0];
  const logoSkewAnim = useState(new Animated.Value(0))[0];
  const formOpacity = useState(new Animated.Value(0))[0];
  const buttonScale = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoSkewAnim, {
          toValue: 0.3,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoSkewAnim, {
          toValue: -0.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoSkewAnim, {
          toValue: 0.15,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(logoSkewAnim, {
          toValue: 0,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        delay: 600,
        friction: 3,
        tension: 60,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSignUp = async () => {
    if (!form.email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!form.password.trim() || form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match or are empty.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      console.log("User signed up successfully: ", userCredential.user);
      setIsLoading(false);

      // Redirect to SignIn screen after successful SignUp
      navigation.replace('SignIn'); // Replace current screen with SignIn
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
                  >

     <ScrollView contentContainerStyle={styles.scrollViewContainer}
      keyboardShouldPersistTaps="handled">
       <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign Up</Text>
        </View>

        <Animated.View style={[styles.form, { opacity: formOpacity }]}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={email => setForm({ ...form, email })}
              placeholder="john@example.com"
              style={styles.inputControl}
              value={form.email}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              secureTextEntry
              onChangeText={password => setForm({ ...form, password })}
              placeholder="***********"
              style={styles.inputControl}
              value={form.password}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              secureTextEntry
              onChangeText={confirmPassword => setForm({ ...form, confirmPassword })}
              placeholder="***********"
              style={styles.inputControl}
              value={form.confirmPassword}
            />
          </View>

          <TouchableOpacity onPress={handleSignUp} style={styles.btn} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} style={styles.link}>
            <Text style={styles.linkText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1a1a2e' },
  keyboardAvoidingView: {flex: 1,},
  scrollViewContainer: { flexGrow: 1, justifyContent: 'center' },  // Ensures scrolling works
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 36 },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  form: { backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 20, padding: 24, shadowColor: '#000', elevation: 10 },
  input: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginBottom: 10 },
  inputControl: { height: 52, backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 16, borderRadius: 14, fontSize: 16, color: '#FFFFFF' },
  btn: { backgroundColor: '#4cc9f0', paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  link: { marginTop: 15, alignItems: 'center' },
  linkText: { color: '#4cc9f0', fontWeight: '600' },
});
