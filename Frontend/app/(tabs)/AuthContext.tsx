// // src/context/AuthContext.tsx
// import React, { createContext, useState, useEffect, ReactNode } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Define the shape of your context
// interface AuthContextType {
//   token: string | null;
//   setToken: (token: string | null) => void;
// }

// // Create the context with default values
// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   setToken: () => {},
// });

// // Props for the Provider
// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     const loadToken = async () => {
//       const storedToken = await AsyncStorage.getItem('token');
//       if (storedToken) setToken(storedToken);
//     };
//     loadToken();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ token, setToken }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the context type
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  isAdmin: false,
  logout: async () => {},
});

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Load token from storage on startup
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setTokenState(storedToken);
          
          // Check if user is admin based on token
          // This is a simplified example - in a real app,
          // you might want to decode the JWT token to get the role
          setIsAdmin(storedToken.includes('Admin'));
        }
      } catch (error) {
        console.error('Failed to load auth token', error);
      }
    };

    loadToken();
  }, []);

  // Set token and update storage
  const setToken = async (newToken: string | null) => {
    try {
      if (newToken) {
        await AsyncStorage.setItem('token', newToken);
        setTokenState(newToken);
        
        // Update admin status
        setIsAdmin(newToken.includes('Admin'));
      } else {
        await AsyncStorage.removeItem('token');
        setTokenState(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Failed to save auth token', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setTokenState(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Failed to remove auth token', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, setToken, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};