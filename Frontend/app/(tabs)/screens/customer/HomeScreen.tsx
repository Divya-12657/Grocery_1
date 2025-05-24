//start of the logout
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
// import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/products`);
      console.log('Fetched products:', response.data);
      // Make sure it's an array
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn('API did not return an array:', response.data);
        setProducts([]); // fallback
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products');
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleLogout = () => {
    // Add logout logic here
    // For example:
    // AsyncStorage.removeItem('userToken');
    // Or call your authentication service's logout function
    
    // Navigate to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.spacer}></View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text>${item.price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { cart })}
        >
          <Text>Cart ({cart.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    padding: 10,
    marginTop: 10,
  },
  productCard: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartButton: {
    padding: 15,
    backgroundColor: '#4285F4',
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#ff6347', // Tomato color for logout
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addButton: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    alignItems: 'center',
  },
});