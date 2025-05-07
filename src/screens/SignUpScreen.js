import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView,
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
import { auth } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animation values with useState to preserve between renders
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideUpAnim] = useState(new Animated.Value(30));
  const [logoScaleAnim] = useState(new Animated.Value(0.8));
  const [logoRotateAnim] = useState(new Animated.Value(0));
  const [formOpacity] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(0.95));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoRotateAnim, {
          toValue: 0.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: -0.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(logoRotateAnim, {
          toValue: 0,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        })
      ]),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        delay: 500,
        friction: 3,
        tension: 60,
        useNativeDriver: true,
      })
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
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

    if (form.password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      
      const user = userCredential.user;
      const db = getDatabase();

      // 2. Create the user record in Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        email: form.email,
        isAdmin: form.email === 'admin@wareed.com', // Auto-set admin for specific email
        uid: user.uid,
        createdAt: new Date().toISOString()
      });

    /*  // 3. Create the user info in the Info node
      await set(ref(db, `Info/${user.uid}`), {
        email: form.email,
        createdAt: new Date().toISOString()
        // Other fields will be added later in UserFormScreen
      }); */

      setIsLoading(false);
      
      // Navigate to additional profile setup or main app
      navigation.replace('SignIn'); 
      
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      
      let errorMessage = "Signup failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContainer} 
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.container, { 
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }] 
          }]}>
            <View style={styles.header}>
              <Animated.View style={{ 
                transform: [
                  { scale: logoScaleAnim },
                  { 
                    rotate: logoRotateAnim.interpolate({
                      inputRange: [-0.2, 0.2],
                      outputRange: ['-10deg', '10deg']
                    }) 
                  }
                ] 
              }}>
                <View style={styles.logoPlaceholder} />
              </Animated.View>
              <Text style={styles.title}>Create Account</Text>
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
                  placeholderTextColor="#aaa"
                  style={styles.inputControl}
                  value={form.email}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password (min 6 characters)</Text>
                <TextInput
                  secureTextEntry
                  onChangeText={password => setForm({ ...form, password })}
                  placeholder="***********"
                  placeholderTextColor="#aaa"
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
                  placeholderTextColor="#aaa"
                  style={styles.inputControl}
                  value={form.confirmPassword}
                />
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  onPress={handleSignUp} 
                  style={styles.btn} 
                  disabled={isLoading}
                >
                  {isLoading ? 
                    <ActivityIndicator color="#fff" /> : 
                    <Text style={styles.btnText}>Sign Up</Text>
                  }
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity 
                onPress={() => navigation.navigate('SignIn')} 
                style={styles.link}
              >
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
  safeArea: { 
    flex: 1, 
    backgroundColor: '#1a1a2e' 
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollViewContainer: { 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  container: { 
    padding: 24, 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 36 
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#4cc9f0',
    borderRadius: 20,
    marginBottom: 20
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    textAlign: 'center' 
  },
  form: { 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderRadius: 20, 
    padding: 24, 
    shadowColor: '#000', 
    elevation: 10 
  },
  input: { 
    marginBottom: 20 
  },
  inputLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#FFFFFF', 
    marginBottom: 10 
  },
  inputControl: { 
    height: 52, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingHorizontal: 16, 
    borderRadius: 14, 
    fontSize: 16, 
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  btn: { 
    backgroundColor: '#4cc9f0', 
    paddingVertical: 14, 
    borderRadius: 30, 
    alignItems: 'center' 
  },
  btnText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
  link: { 
    marginTop: 15, 
    alignItems: 'center' 
  },
  linkText: { 
    color: '#4cc9f0', 
    fontWeight: '600' 
  }
});