import React, { useState, useEffect, useContext } from 'react';
import { 
  StyleSheet, 
  SafeAreaView, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { ref, get } from 'firebase/database';
import { UserContext } from '../context/UserContext';

export default function SignInScreen() {
  const navigation = useNavigation();
  const { setUserName, setBloodType, setAge, setIsAdmin, setUserId } = useContext(UserContext);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const slideUpAnim = useState(() => new Animated.Value(30))[0];
  const logoScaleAnim = useState(() => new Animated.Value(0.8))[0];
  const logoRotateAnim = useState(() => new Animated.Value(0))[0];
  const formOpacity = useState(() => new Animated.Value(0))[0];
  const buttonScale = useState(() => new Animated.Value(0.95))[0];

  useEffect(() => {
    // Animation sequence
    Animated.parallel([
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
    ]).start();
  }, []);

  // Function to fetch and combine user data from both tables
  const fetchCombinedUserData = async (userId) => {
    try {
      const db = database;
      
      // Get basic user data
      const userRef = ref(db, 'users/' + userId);
      const userSnapshot = await get(userRef);
      
      if (!userSnapshot.exists()) {
        return null;
      }
      
      // Get user info data
      const infoRef = ref(db, 'Info/' + userId);
      const infoSnapshot = await get(infoRef);
      
      // Combine the data
      const userData = userSnapshot.val();
      const infoData = infoSnapshot.exists() ? infoSnapshot.val() : {};
      
      // Merge the data into a single object
      const combinedData = {
        ...userData,
        ...infoData,
        uid: userId
      };
      
      return combinedData;
    } catch (error) {
      console.error("Error fetching combined user data:", error);
      throw error;
    }
  };

  const fetchUserData = async (user) => {
    try {
      setIsLoading(true);
      
      // Get references to both user and info data
      const userRef = ref(database, `users/${user.uid}`);
      const infoRef = ref(database, `Info/${user.uid}`);
      
      // Fetch both data sources in parallel
      const [userSnapshot, infoSnapshot] = await Promise.all([
        get(userRef),
        get(infoRef)
      ]);
  
      // Check if user exists
      if (!userSnapshot.exists()) {
        throw new Error("User account not found");
      }
  
      // Combine the data
      const userData = userSnapshot.val();
      const infoData = infoSnapshot.exists() ? infoSnapshot.val() : {};
  
      const combinedData = {
        ...userData,
        ...infoData,
        uid: user.uid
      };
  
      // Update context
      setUserId(user.uid);
      setIsAdmin(combinedData.isAdmin || false);
      setUserName(combinedData.name || 'غير معرف');
      setBloodType(combinedData.bloodType || 'غير محدد');
      setAge(combinedData.age || 'غير محدد');
  
      // Determine where to navigate
      let targetScreen = 'UserForm';
      if (combinedData.isAdmin) {
        targetScreen = 'Admin';
      } else if (combinedData.name && combinedData.bloodType && combinedData.age) {
        targetScreen = 'MainApp';
      }
  
      navigation.reset({
        index: 0,
        routes: [{ name: targetScreen }],
      });
  
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert(
        "خطأ", 
        error.code === 'PERMISSION_DENIED' 
          ? "لا تملك صلاحية الوصول إلى البيانات" 
          : "فشل تحميل بيانات المستخدم"
      );
      navigation.navigate('UserForm');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    signInWithEmailAndPassword(auth, form.email, form.password)
      .then((userCredential) => {
        fetchUserData(userCredential.user);
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert("Error", error.message);
      });
  };

  const handleForgotPassword = () => {
    if (!form.email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    sendPasswordResetEmail(auth, form.email)
      .then(() => {
        Alert.alert('Success', 'Password reset email sent!');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
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
                Sign in to <Text style={styles.titleHighlight}>Wareed</Text>{'\n'}
                سجل دخولك في <Text style={styles.titleHighlight}>وريد</Text>
              </Animated.Text>
            </View>

            <Animated.View style={[styles.form, { opacity: formOpacity }]}>
              <View style={styles.input}>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  keyboardType="email-address"
                  onChangeText={email => setForm({ ...form, email })}
                  placeholder="john@example.com"
                  placeholderTextColor="#92929D"
                  style={styles.inputControl}
                  value={form.email}
                />
              </View>

              <View style={styles.input}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  onChangeText={password => setForm({ ...form, password })}
                  placeholder="***********"
                  placeholderTextColor="#92929D"
                  style={styles.inputControl}
                  secureTextEntry={true}
                  value={form.password}
                />
              </View>

              <TouchableOpacity 
                onPress={handleForgotPassword}
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
              >
                <Text style={styles.formLink}>Forgot password?</Text>
              </TouchableOpacity>

              <View style={styles.formAction}>
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <TouchableOpacity 
                    onPress={handleSignIn}
                    disabled={isLoading}
                    style={[styles.btn, isLoading && styles.btnDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in button"
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.btnText}>Sign in</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.formFooterContainer, { opacity: formOpacity }]}>
              <TouchableOpacity 
                onPress={handleSignUp}
                accessibilityRole="button"
                accessibilityLabel="Sign up link"
              >
                <Text style={styles.formFooter}>
                  Don't have an account?{' '}
                  <Text style={styles.formFooterLink}>Sign up</Text>
                </Text>
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
    fontWeight: '700',
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
});