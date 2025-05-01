import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // User information states
  const [userName, setUserName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [age, setAge] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  
  // Language state (default to Arabic)
  const [language, setLanguage] = useState('ar');

  return (
    <UserContext.Provider 
      value={{ 
        // User info
        userName, 
        setUserName, 
        bloodType, 
        setBloodType, 
        age, 
        setAge,
        
        // Language
        language,
        setLanguage
      }}
    >
      {children}
    </UserContext.Provider>
  );
};