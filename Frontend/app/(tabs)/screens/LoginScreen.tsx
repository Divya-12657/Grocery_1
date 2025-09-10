// import React, { useState, useContext } from 'react';
// import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
// import axios from 'axios';
// import CONFIG from '../../config';
// import { AuthContext } from './../AuthContext';

// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [resetEmail, setResetEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [resetPassword, setResetPassword] = useState('');
//   const { setCredentials } = useContext(AuthContext);

//   const handleLogin = async () => {
//     try {
//       console.log('Attempting login for:', email);
//       setIsLoading(true);

//       const response = await axios.post(`${CONFIG.API_URL}/login`, {
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       const tokenWithPrefix = `Bearer ${response.data.token}`;
//       const role = response.data.role;

//       // Save token and role to context (also saves to AsyncStorage internally)
//       await setCredentials(tokenWithPrefix, role);

//       // Navigate based on role
//       if (role === 'Admin') {
//         navigation.replace('AdminHome');
//       } else if (role === 'Delivery') {
//         navigation.replace('Delivery');
//       } else {
//         navigation.replace('CustomerHome');
//       }

//     } catch (error) {
//       console.error('Login error:', error.response?.data || error.message);
//       Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!resetEmail.trim()) {
//       Alert.alert('Error', 'Please enter your email address');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       console.log('Sending password reset for:', resetEmail);

//       await axios.post(`${CONFIG.API_URL}/forgot-password`, {
//         email: resetEmail.trim().toLowerCase(),
//         new_password: resetPassword,
//       });

//       Alert.alert(
//         'Reset Link Sent',
//         'A password reset link has been sent to your email address. Please check your inbox.',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setShowForgotPassword(false);
//               setResetEmail('');
//             }
//           }
//         ]
//       );

//     } catch (error) {
//       console.error('Forgot password error:', error.response?.data || error.message);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message || 'Failed to send reset link. Please try again.'
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (showForgotPassword) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Reset Password</Text>
//         <Text style={styles.subtitle}>
//           Enter your email address and new password to reset your password.
//         </Text>
        
//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           value={resetEmail}
//           autoCapitalize="none"
//           keyboardType="email-address"
//           onChangeText={setResetEmail}
//         />
        
//         <TextInput
//           style={styles.input}
//           placeholder="New Password"
//           value={resetPassword}
//           onChangeText={setResetPassword}
//           secureTextEntry
//         />
        
//         <View style={styles.buttonContainer}>
//           <Button 
//             title={isLoading ? "Resetting..." : "Reset Password"} 
//             onPress={handleForgotPassword}
//             disabled={isLoading}
//           />
//         </View>
        
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => {
//             setShowForgotPassword(false);
//             setResetEmail('');
//             setResetPassword('');
//           }}
//         >
//           <Text style={styles.backButtonText}>Back to Login</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Grocery Delivery App</Text>
      
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         autoCapitalize="none"
//         keyboardType="email-address"
//         onChangeText={setEmail}
//       />
      
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         onSubmitEditing={handleLogin}
//       />
      
//       <View style={styles.buttonContainer}>
//         <Button 
//           title={isLoading ? "Logging in..." : "Login"} 
//           onPress={handleLogin}
//           disabled={isLoading}
//         />
//       </View>
      
//       <TouchableOpacity 
//         style={styles.forgotPasswordButton}
//         onPress={() => setShowForgotPassword(true)}
//       >
//         <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#666',
//     lineHeight: 22,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 15,
//     marginBottom: 15,
//     borderRadius: 8,
//     fontSize: 16,
//   },
//   buttonContainer: {
//     marginBottom: 20,
//   },
//   forgotPasswordButton: {
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   forgotPasswordText: {
//     color: '#007AFF',
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
//   backButton: {
//     alignItems: 'center',
//     paddingVertical: 15,
//     marginTop: 10,
//   },
//   backButtonText: {
//     color: '#666',
//     fontSize: 16,
//   },
// });

import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import CONFIG from '../../config';
import { AuthContext } from './../AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setCredentials } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      console.log('Attempting login for:', email);
      setIsLoading(true);

      const response = await axios.post(`${CONFIG.API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const tokenWithPrefix = `Bearer ${response.data.token}`;
      const role = response.data.role;

      // Save token and role to context
      await setCredentials(tokenWithPrefix, role);

      // Navigate based on role
      if (role === 'Admin') {
        navigation.replace('AdminHome');
      } else if (role === 'Delivery') {
        navigation.replace('Delivery');
      } else {
        navigation.replace('CustomerHome');
      }

    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim() || !resetPassword.trim()) {
      Alert.alert('Error', 'Please enter both email and new password');
      return;
    }

    if (resetPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending password reset for:', resetEmail);

      await axios.post(`${CONFIG.API_URL}/forgot-password`, {
        email: resetEmail.trim().toLowerCase(),
        new_password: resetPassword,   // ✅ send new password
      });

      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset. You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowForgotPassword(false);
              setResetEmail('');
              setResetPassword('');
              navigation.replace('Login');  // ✅ go back to login screen
            }
          }
        ]
      );

    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and new password to reset your password.
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={resetEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setResetEmail}
        />
        
        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={resetPassword}
          onChangeText={setResetPassword}
          secureTextEntry
        />
        
        <View style={styles.buttonContainer}>
          <Button 
            title={isLoading ? "Resetting..." : "Reset Password"} 
            onPress={handleForgotPassword}
            disabled={isLoading}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setShowForgotPassword(false);
            setResetEmail('');
            setResetPassword('');
          }}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery Delivery App</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onSubmitEditing={handleLogin}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          title={isLoading ? "Logging in..." : "Login"} 
          onPress={handleLogin}
          disabled={isLoading}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.forgotPasswordButton}
        onPress={() => setShowForgotPassword(true)}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
