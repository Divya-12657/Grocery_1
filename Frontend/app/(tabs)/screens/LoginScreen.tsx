// // AuthContext.js
// // LoginScreen.tsx
// import React, { useState, useContext } from 'react';
// import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CONFIG from '../../config';
// import { AuthContext } from './../AuthContext';

// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { setToken } = useContext(AuthContext);

//   const handleLogin = async () => {
//     try {
//       console.log('Attempting login for:', email);
//       const response = await axios.post(`${CONFIG.API_URL}/login`, {
//         email: email.trim().toLowerCase(),
//         password,
//       });

//       const tokenWithPrefix = `Bearer ${response.data.token}`;
//       await AsyncStorage.setItem('token', tokenWithPrefix);
//       setToken(tokenWithPrefix);

//       const role = response.data.role;

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
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Grocery Delivery App</Text>
//       <TextInput
//         style={styles.input}
//         placeholder="Email"
//         value={email}
//         autoCapitalize="none"
//         onChangeText={setEmail}
//       />
//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         onSubmitEditing={handleLogin} // 🔥 Add this line

//       />
//       <Button title="Login" onPress={handleLogin} />
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
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//   },
// });

import React, { useState, useContext } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import axios from 'axios';
import CONFIG from '../../config';
import { AuthContext } from './../AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { setCredentials } = useContext(AuthContext); // ✅ updated

  const handleLogin = async () => {
    try {
      console.log('Attempting login for:', email);

      const response = await axios.post(`${CONFIG.API_URL}/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const tokenWithPrefix = `Bearer ${response.data.token}`;
      const role = response.data.role;

      // ✅ Save token and role to context (also saves to AsyncStorage internally)
      await setCredentials(tokenWithPrefix, role);

      // ✅ Navigate based on role
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grocery Delivery App</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
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
      <Button title="Login" onPress={handleLogin} />
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
