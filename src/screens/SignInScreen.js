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
import { auth, database } from '../firebaseConfig'; // التأكد من استيراد database بشكل صحيح
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"; // Firebase Auth methods
import { ref, get } from 'firebase/database'; // لاستيراد الطرق للتعامل مع Realtime Database
import { UserContext } from '../context/UserContext'; // استيراد UserContext

export default function SignInScreen() {
  const navigation = useNavigation();
  const { setUserName, setBloodType, setAge } = useContext(UserContext);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideUpAnim = useState(new Animated.Value(30))[0];
  const logoScaleAnim = useState(new Animated.Value(0.5))[0];
  const logoSkewAnim = useState(new Animated.Value('0deg'))[0]; // Changed to use degrees
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
          toValue: '30deg', // Changed to use degrees
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoSkewAnim, {
          toValue: '-10deg', // Changed to use degrees
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoSkewAnim, {
          toValue: '15deg', // Changed to use degrees
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(logoSkewAnim, {
          toValue: '0deg', // Changed to use degrees
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

  const loadUserData = async (user) => {
    const db = database;

    // تحميل بيانات المستخدم الشخصية من `Info/{user.uid}`
    const userRef = ref(db, 'Info/' + user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      // تخزين البيانات في UserContext
      setUserName(userData.name);
      setBloodType(userData.bloodType);
      setAge(userData.age);

      // التحقق من اكتمال البيانات الشخصية
      if (userData.name && userData.bloodType && userData.age) {
        // توجيه المستخدم إلى MainApp إذا كانت البيانات مكتملة
        navigation.replace('MainApp');
      } else {
        // إذا كانت البيانات غير مكتملة، توجيههم إلى UserForm
        navigation.replace('UserForm');
      }
    } else {
      console.log("لا توجد بيانات شخصية للمستخدم.");
      navigation.replace('UserForm');
    }
  };

  const handleSignIn = () => {
    if (!form.email.trim()) {
      shakeAnimation();
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    if (!form.password.trim()) {
      shakeAnimation();
      Alert.alert("Error", "Please enter your password.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      shakeAnimation();
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    // Loading animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    // Firebase Authentication
    signInWithEmailAndPassword(auth, form.email, form.password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log("User signed in: ", user);

        // جلب بيانات المستخدم بعد تسجيل الدخول
        await loadUserData(user);  // جلب البيانات من قاعدة البيانات
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

  const shakeAnimation = () => {
    const shake = new Animated.Value(0);

    Animated.sequence([ 
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();

    return shake;
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
            style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
          >
            <View style={styles.header}>
              <Animated.Image
                alt="App Logo"
                resizeMode="contain"
                style={[styles.headerImg, { transform: [{ scale: logoScaleAnim }, { skewX: logoSkewAnim }] }]}
                source={require('../pic/Wareed_logoo.png')}             
              />
              <Animated.Text 
                style={[styles.title, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
              >
                Sign in to <Text style={styles.titleHighlight}>Wareed</Text>
              </Animated.Text>
              <Animated.Text 
                style={[styles.subtitle, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}
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
          </Animated.View>
        </ScrollView>

        <Animated.View style={{ opacity: formOpacity }}>
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
    height: 100,
    marginBottom: 24,
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
  formFooter: {
    padding: 16,
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