import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://192.168.0.165/products');
      setProducts(response.data);
    } catch (error) {
      alert('Error fetching products');
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Adding product...');
      await axios.post('http://192.168.0.165:5000/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock)
      }, {
        headers: { Authorization: token }
      });
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '' });
      fetchProducts();
    } catch (error) {
      console.log('dfhbjhfbshb')
      alert('Error adding product');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newProduct.name}
          onChangeText={(text) => setNewProduct({...newProduct, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newProduct.description}
          onChangeText={(text) => setNewProduct({...newProduct, description: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={newProduct.price}
          onChangeText={(text) => setNewProduct({...newProduct, price: text})}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Stock"
          value={newProduct.stock}
          onChangeText={(text) => setNewProduct({...newProduct, stock: text})}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Category"
          value={newProduct.category}
          onChangeText={(text) => setNewProduct({...newProduct, category: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Stock: {item.stock}</Text>
            <Text>Category: {item.category}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  addForm: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});