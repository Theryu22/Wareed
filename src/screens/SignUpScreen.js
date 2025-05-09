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

      // 2. Create user records in both database locations
      await Promise.all([
        // Basic user data in 'users' node
        set(ref(db, `users/${user.uid}`), {
          email: form.email,
          isAdmin: form.email === 'admin@wareed.com', // Special admin email
          createdAt: new Date().toISOString(),
          uid: user.uid
        }),
        
        // Additional user info in 'Info' node
        set(ref(db, `Info/${user.uid}`), {
          email: form.email,
          createdAt: new Date().toISOString(),
          // These fields will be empty initially and filled in UserFormScreen
          name: '',
          age: '',
          bloodType: ''
        })
      ]);

      setIsLoading(false);
      
      // Navigate to UserFormScreen to complete profile
      navigation.replace('UserForm', { 
        uid: user.uid,
        email: form.email 
      });
      
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      
      let errorMessage = "Signup failed. Please try again.";
      switch(error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email is already registered.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password should be at least 6 characters.";
          break;
        case 'PERMISSION_DENIED':
          errorMessage = "Database write permission denied.";
          break;
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
             <Animated.View 
                      style={[styles.container, { 
                        opacity: fadeAnim,
                        transform: [{ translateY: slideUpAnim }] 
                      }]}
                    >
                      <View style={styles.header}>
                        <Animated.Image
                          alt="App Logo"
                          resizeMode="contain"
                          style={[styles.headerImg, { 
                            transform: [
                              { scale: logoScaleAnim },
                              { 
                                rotate: logoRotateAnim.interpolate({
                                  inputRange: [-0.2, 0.2],
                                  outputRange: ['-10deg', '10deg']
                                }) 
                              }
                            ] 
                          }]}
                          source={require('../pic/Wareed_logoo.png')}
                        />
                        <Animated.Text 
                          style={[styles.title, { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }] 
                          }]}
                        >
                          Sign Up to <Text style={styles.titleHighlight}>Wareed</Text>
                        </Animated.Text>
                        <Animated.Text 
                          style={[styles.subtitle, { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideUpAnim }] 
                          }]}
                        >
                          قم بالتسجيل لسهولة الوصول لحسابك الشخصي في وريد
                        </Animated.Text>
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
    backgroundColor: '#1a1a2e',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: '#4cc9f0',
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  headerImg: {
    width: 200,
    height: 150,
    marginBottom: 0,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  formAction: {
    marginVertical: 24,
  },
  formLink: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginBottom: 16,
  },
  formFooterContainer: {
    padding: 16,
    paddingBottom: 40,
    marginTop: 20,
  },
  formFooter: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  formFooterLink: {
    textDecorationLine: 'underline',
    color: '#4cc9f0',
    fontWeight: '700',
  },
  input: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
    opacity: 0.9,
  },
  inputControl: {
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#4cc9f0',
    shadowColor: '#4cc9f0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
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