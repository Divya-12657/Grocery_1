import React, { useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';

export default function CartScreen({ route, navigation }) {
  const { cart } = route.params;
  const [address, setAddress] = useState('');
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const { token } = useContext(AuthContext); // ✅ Get token from context

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter a delivery address');
      return;
    }

    try {
      const response = await axios.post(
        `${CONFIG.API_URL}/orders`,
        {
          total_amount: total,
          delivery_address: address,
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: 1, // You can later allow quantity updates
            price: item.price,
          })),
        },
        {
          headers: { Authorization:  token }, // ✅ Use token from context
        }
      );

      Alert.alert('Order placed successfully!');
      navigation.navigate('Payment', { cart, address, total });

    } catch (error) {
      console.error('Checkout error:', error?.response?.data || error.message);
      Alert.alert('Checkout failed', error?.response?.data?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>${item.price}</Text>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Delivery Address"
        value={address}
        onChangeText={setAddress}
      />

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${total}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.buttonText}>Place Order</Text>
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
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  totalContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});


