import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/images/icon.png')} // App logo
        style={styles.logo}
      />

      <Text style={styles.title}>Welcome to Grocery Market</Text>
      <Text style={styles.subtitle}>Freshness delivered to your door</Text>

      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <Text style={styles.feature}>🥬 Fresh Local Produce</Text>
          <Text style={styles.feature}>🛒 One-Tap Add to Cart</Text>
          <Text style={styles.feature}>🚚 Live Delivery Tracking</Text>
          <Text style={styles.feature}>💳 PayLater & UPI Support</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#43a047',
  },
  loginButton: {
    backgroundColor: '#1e88e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  features: {
    marginTop: 10,
    width: '100%',
  },
  feature: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    paddingVertical: 4,
  },
});

export default HomeScreen;




