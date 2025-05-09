// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { getDatabase, ref, get } from 'firebase/database';

// 1. First create the context with proper default values
const UserContext = createContext({
  // User data
  userId: null,
  userName: '',
  bloodType: '',
  age: '',
  email: '',
  isAdmin: false,
  
  // Status
  isLoading: true,
  
  // Methods
  setUserId: () => {},
  setUserName: () => {},
  setBloodType: () => {},
  setAge: () => {},
  setIsAdmin: () => {},
  setEmail: () => {},
});

// 2. Then create the provider component
export const UserProvider = ({ children }) => {
  const [state, setState] = useState({
    userId: null,
    userName: '',
    bloodType: '',
    age: '',
    email: '',
    isAdmin: false,
    isLoading: true
  });

  // Individual setter functions
  const setUserId = (userId) => setState(prev => ({...prev, userId}));
  const setUserName = (userName) => setState(prev => ({...prev, userName}));
  const setBloodType = (bloodType) => setState(prev => ({...prev, bloodType}));
  const setAge = (age) => setState(prev => ({...prev, age}));
  const setIsAdmin = (isAdmin) => setState(prev => ({...prev, isAdmin}));
  const setEmail = (email) => setState(prev => ({...prev, email}));

  const fetchUserData = async (userId) => {
    try {
      const db = getDatabase();
      const [userSnapshot, infoSnapshot] = await Promise.all([
        get(ref(db, `users/${userId}`)),
        get(ref(db, `Info/${userId}`))
      ]);

      return {
        userId,
        userName: infoSnapshot?.val()?.name || '',
        bloodType: infoSnapshot?.val()?.bloodType || '',
        age: infoSnapshot?.val()?.age || '',
        email: userSnapshot?.val()?.email || '',
        isAdmin: userSnapshot?.val()?.isAdmin || false,
        isLoading: false
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return {
        ...state,
        isLoading: false
      };
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = await fetchUserData(user.uid);
        setState(userData);
      } else {
        setState({
          userId: null,
          userName: '',
          bloodType: '',
          age: '',
          email: '',
          isAdmin: false,
          isLoading: false
        });
      }
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider
      value={{
        ...state,
        setUserId,
        setUserName,
        setBloodType,
        setAge,
        setIsAdmin,
        setEmail
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Export both the context and provider
export { UserContext };
