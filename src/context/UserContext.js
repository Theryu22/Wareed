import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase/firebaseConfig"; // تأكد من استيراد auth بشكل صحيح
import { getDatabase, ref, get } from "firebase/database"; // استيراد قاعدة البيانات

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // User information states
  const [userName, setUserName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [age, setAge] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState(null);

  // Language state (default to Arabic)
  const [language, setLanguage] = useState('ar');

  // Load user data when user is logged in
  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser; // Get current user after login
      if (user) {
        const userRef = ref(getDatabase(), `users/${user.uid}`); // Get the user data from Firebase
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserName(userData.name || "غير معرف");
          setBloodType(userData.bloodType || "غير محدد");
          setAge(userData.age || "غير محدد");
          setIsAdmin(userData.isAdmin || false); // Assuming 'isAdmin' is stored in Firebase
          setUserId(user.uid);
        }
      }
    };
    
    loadUserData();
  }, [auth.currentUser]);

  return (
    <UserContext.Provider 
      value={{ 
        userName, 
        setUserName, 
        bloodType, 
        setBloodType, 
        age, 
        setAge,
        isAdmin,
        setIsAdmin,
        language,
        setLanguage,
        setUserId,
        userId // Store the userId as well
      }}
    >
      {children}
    </UserContext.Provider>
  );
};