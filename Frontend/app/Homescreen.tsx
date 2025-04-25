import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';  // To handle navigation

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* App Name */}
      <Text style={styles.header}>Grocery Market</Text>

      {/* Introduction */}
      <Text style={styles.intro}>
        Welcome to Grocery Market! Your one-stop shop for fresh groceries.
      </Text>

      {/* Register Button */}
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}  // Navigates to the Register screen
      />

      {/* Login Button */}
      <Button
        title="Login"
        onPress={() => navigation.navigate('Login')}  // Navigates to the Login screen
      />

      {/* Features List (Optional) */}
      <Text style={styles.features}>
        - Browse products{"\n"}
        - Add to cart{"\n"}
        - Track your orders
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  intro: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  features: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;
