import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';

export default function ProductScreen({ products }) {
  const { token } = useContext(AuthContext);

  const handleAddToCart = async (product) => {
    try {
      await axios.post(
        `${CONFIG.API_URL}/cart/add`,
        {
          product_id: product.id,
          quantity: 1,
          price: product.price,
        },
        {
          headers: { Authorization: token },
        }
      );
      Alert.alert('Added to cart!');
    } catch (error) {
      console.error('Add to cart error:', error?.response?.data || error.message);
      Alert.alert('Failed to add to cart');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>${item.price}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  productItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 5,
  },
  name: { fontSize: 16 },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff' },
});