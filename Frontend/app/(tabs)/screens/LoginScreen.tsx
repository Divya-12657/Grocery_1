import React, { useState,useContext} from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../../config';
import { AuthContext } from './../AuthContext'; 


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
       console.log('Attempting login for:', email);
       const response = await axios.post(`${CONFIG.API_URL}/login`, {
        email,
      password
      });
      const tokenWithPrefix = `Bearer ${response.data.token}`;
      
      await AsyncStorage.setItem('token', tokenWithPrefix);
      navigation.replace(response.data.role === 'Admin' ? 'AdminHome' : 'CustomerHome');
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
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
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