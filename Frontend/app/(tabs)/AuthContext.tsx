// // AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // Define the context type
// interface AuthContextType {
//   token: string | null;
//   setToken: (token: string | null) => void;
//   isAdmin: boolean;
//   logout: () => Promise<void>;
// }

// // Create the context with default values
// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   setToken: () => {},
//   isAdmin: false,
//   logout: async () => {},
// });

// // Create the provider component
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setTokenState] = useState<string | null>(null);
//   const [isAdmin, setIsAdmin] = useState<boolean>(false);

//   // Load token from storage on startup
//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         if (storedToken) {
//           setTokenState(storedToken);
          
//           // Check if user is admin based on token
//           // This is a simplified example - in a real app,
//           // you might want to decode the JWT token to get the role
//           setIsAdmin(storedToken.includes('Admin'));
//         }
//       } catch (error) {
//         console.error('Failed to load auth token', error);
//       }
//     };

//     loadToken();
//   }, []);

//   // Set token and update storage
//   const setToken = async (newToken: string | null) => {
//     try {
//       if (newToken) {
//         await AsyncStorage.setItem('token', newToken);
//         setTokenState(newToken);
        
//         // Update admin status
//         setIsAdmin(newToken.includes('Admin'));
//       } else {
//         await AsyncStorage.removeItem('token');
//         setTokenState(null);
//         setIsAdmin(false);
//       }
//     } catch (error) {
//       console.error('Failed to save auth token', error);
//     }
//   };

//   // Logout function
//   const logout = async () => {
//     try {
//       await AsyncStorage.removeItem('token');
//       setTokenState(null);
//       setIsAdmin(false);
//     } catch (error) {
//       console.error('Failed to remove auth token', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ token, setToken, isAdmin, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// AuthContext.tsx
// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthContextType {
//   token: string | null;
//   setToken: (token: string | null) => void;
//   isAdmin: boolean;
//   // logout: () => Promise<void>;
//   logout: (navigation?: any) => Promise<void>;
//   loading: boolean;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   setToken: () => {},
//   isAdmin: false,
//   // logout: async () => {},
//   logout: async (_navigation?: any) => {}, // ✅ updated
//   loading: true,
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setTokenState] = useState<string | null>(null);
//   const [isAdmin, setIsAdmin] = useState<boolean>(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         if (storedToken) {
//           setTokenState(storedToken);
//           setIsAdmin(storedToken.includes('Admin'));
//         }
//       } catch (error) {
//         console.error('Failed to load auth token', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadToken();
//   }, []);

//   const setToken = async (newToken: string | null) => {
//     try {
//       if (newToken) {
//         await AsyncStorage.setItem('token', newToken);
//         setTokenState(newToken);
//         setIsAdmin(newToken.includes('Admin'));
//       } else {
//         await AsyncStorage.removeItem('token');
//         setTokenState(null);
//         setIsAdmin(false);
//       }
//     } catch (error) {
//       console.error('Failed to save auth token', error);
//     }
//   };

//   // const logout = async () => {
//   //   try {
//   //     await AsyncStorage.removeItem('token');
//   //     setTokenState(null);
//   //     setIsAdmin(false);
//   //   } catch (error) {
//   //     console.error('Failed to remove auth token', error);
//   //   }
//   // };

//   const logout = async (navigation?: any) => {
//     try {
//       await AsyncStorage.removeItem('token');
//       setTokenState(null);
//       setIsAdmin(false);
  
//       // ✅ Secure navigation reset
//       if (navigation) {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'Login' }],
//         });
//       }
//     } catch (error) {
//       console.error('Failed to remove auth token', error);
//     }
//   };
  

//   return (
//     <AuthContext.Provider value={{ token, setToken, isAdmin, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthContextType {
//   token: string | null;
//   role: string | null;
//   setCredentials: (token: string | null, role: string | null) => void;
//   logout: (navigation?: any) => Promise<void>;
//   loading: boolean;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   setCredentials: () => {},
//   logout: async (_navigation?: any) => {},
//   loading: true,
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadCredentials = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         const storedRole = await AsyncStorage.getItem('role');
//         if (storedToken) setToken(storedToken);
//         if (storedRole) setRole(storedRole);
//       } catch (error) {
//         console.error('Failed to load credentials:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadCredentials();
//   }, []);

//   const setCredentials = async (newToken: string | null, newRole: string | null) => {
//     try {
//       if (newToken && newRole) {
//         await AsyncStorage.setItem('token', newToken);
//         await AsyncStorage.setItem('role', newRole);
//         setToken(newToken);
//         setRole(newRole);
//       } else {
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('role');
//         setToken(null);
//         setRole(null);
//       }
//     } catch (error) {
//       console.error('Failed to save credentials:', error);
//     }
//   };

//   // const logout = async (navigation?: any) => {
//   //   try {
//   //     await AsyncStorage.removeItem('token');
//   //     await AsyncStorage.removeItem('role');
//   //     setToken(null);
//   //     setRole(null);

//   //     if (navigation) {
//   //       navigation.reset({
//   //         index: 0,
//   //         routes: [{ name: 'Login' }],
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.error('Logout failed:', error);
//   //   }
//   // };

//   const logout = async (navigation?: any) => {
//     console.log('[AuthContext] Starting logout process...');
//     console.log('[AuthContext] Navigation object received:', !!navigation);
    
//     try {
//       console.log('[AuthContext] Removing token from AsyncStorage...');
//       await AsyncStorage.removeItem('token');
      
//       console.log('[AuthContext] Removing role from AsyncStorage...');
//       await AsyncStorage.removeItem('role');
      
//       console.log('[AuthContext] Setting state to null...');
//       setToken(null);
//       setRole(null);
      
//       if (navigation) {
//         console.log('[AuthContext] Navigation available, attempting to navigate...');
//         console.log('[AuthContext] Navigation methods:', Object.keys(navigation));
        
//         navigation.reset({
//           index: 0,
//           routes: [{ name: 'Login' }],
//         });
//         console.log('[AuthContext] Navigation reset completed');
//       } else {
//         console.log('[AuthContext] No navigation object provided');
//       }
      
//       console.log('[AuthContext] Logout completed successfully');
//     } catch (error) {
//       console.error('[AuthContext] Logout failed:', error);
//       console.error('[AuthContext] Error details:', JSON.stringify(error, null, 2));
//     }
//   };
//   return (
//     <AuthContext.Provider value={{ token, role, setCredentials, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthContextType {
//   token: string | null;
//   role: string | null;
//   setCredentials: (token: string | null, role: string | null) => void;
//   logout: (navigation?: any) => Promise<void>;
//   loading: boolean;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   setCredentials: () => {},
//   logout: async (_navigation?: any) => {},
//   loading: true,
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadCredentials = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         const storedRole = await AsyncStorage.getItem('role');
//         if (storedToken) setToken(storedToken);
//         if (storedRole) setRole(storedRole);
//       } catch (error) {
//         console.error('Failed to load credentials:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadCredentials();
//   }, []);

//   const setCredentials = async (newToken: string | null, newRole: string | null) => {
//     try {
//       if (newToken && newRole) {
//         await AsyncStorage.setItem('token', newToken);
//         await AsyncStorage.setItem('role', newRole);
//         setToken(newToken);
//         setRole(newRole);
//       } else {
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('role');
//         setToken(null);
//         setRole(null);
//       }
//     } catch (error) {
//       console.error('Failed to save credentials:', error);
//     }
//   };

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: async () => {
//             console.log('[ProfileScreen] User confirmed logout');
//             try {
//               console.log('[ProfileScreen] Calling logout from AuthContext...');
//               await logout(); // This should work since logout is destructured from useContext
//               console.log('[ProfileScreen] Logout completed');
//             } catch (error) {
//               console.error('[ProfileScreen] Logout error:', error);
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, setCredentials, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// interface AuthContextType {
//   token: string | null;
//   role: string | null;
//   setCredentials: (token: string | null, role: string | null) => void;
//   logout: () => Promise<void>;
//   loading: boolean;
// }

// export const AuthContext = createContext<AuthContextType>({
//   token: null,
//   role: null,
//   setCredentials: () => {},
//   logout: async () => {},
//   loading: true,
// });

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [role, setRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadCredentials = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('token');
//         const storedRole = await AsyncStorage.getItem('role');
//         if (storedToken) setToken(storedToken);
//         if (storedRole) setRole(storedRole);
//       } catch (error) {
//         console.error('Failed to load credentials:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadCredentials();
//   }, []);

//   const setCredentials = async (newToken: string | null, newRole: string | null) => {
//     try {
//       if (newToken && newRole) {
//         await AsyncStorage.setItem('token', newToken);
//         await AsyncStorage.setItem('role', newRole);
//         setToken(newToken);
//         setRole(newRole);
//       } else {
//         await AsyncStorage.removeItem('token');
//         await AsyncStorage.removeItem('role');
//         setToken(null);
//         setRole(null);
//       }
//     } catch (error) {
//       console.error('Failed to save credentials:', error);
//     }
//   };

//   // This is the logout function that should be in AuthContext
//   const logout = async () => {
//     console.log('[AuthContext] Starting logout process...');
    
//     try {
//       console.log('[AuthContext] Removing credentials from AsyncStorage...');
//       await AsyncStorage.removeItem('token');
//       await AsyncStorage.removeItem('role');
      
//       console.log('[AuthContext] Clearing state...');
//       setToken(null);
//       setRole(null);
      
//       console.log('[AuthContext] Logout completed - app should automatically redirect');
//     } catch (error) {
//       console.error('[AuthContext] Logout failed:', error);
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ token, role, setCredentials, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };


import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  token: string | null;
  role: string | null;
  setCredentials: (token: string | null, role: string | null) => void;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  setCredentials: () => {},
  logout: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedRole = await AsyncStorage.getItem('role');
        if (storedToken) setToken(storedToken);
        if (storedRole) setRole(storedRole);
      } catch (error) {
        console.error('Failed to load credentials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCredentials();
  }, []);

  const setCredentials = async (newToken: string | null, newRole: string | null) => {
    try {
      if (newToken && newRole) {
        await AsyncStorage.setItem('token', newToken);
        await AsyncStorage.setItem('role', newRole);
        setToken(newToken);
        setRole(newRole);
      } else {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        setToken(null);
        setRole(null);
      }
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  // Simple logout - just clear credentials
  // Your AppNavigator will automatically handle navigation when token becomes null
  const logout = async () => {
    console.log('[AuthContext] Starting logout process...');
    try {
      console.log('[AuthContext] Removing credentials from AsyncStorage...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('role');
      
      // Clear any other user-related data
      await AsyncStorage.removeItem('userProfile');
      await AsyncStorage.removeItem('cart');
      await AsyncStorage.removeItem('userPreferences');
      
      console.log('[AuthContext] Clearing state...');
      setToken(null);
      setRole(null);
      
      console.log('[AuthContext] Logout completed - AppNavigator will automatically redirect to Home screen');
      
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ token, role, setCredentials, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};