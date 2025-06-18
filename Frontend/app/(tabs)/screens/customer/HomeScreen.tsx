// HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${CONFIG.API_URL}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId
        ? `${CONFIG.API_URL}/products/category/${categoryId}`
        : `${CONFIG.API_URL}/products`;
      const res = await axios.get(url);
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchProducts(categoryId);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory === item.id && styles.selectedCategoryItem]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.selectedCategoryText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => {
    const quantityInCart = cart.filter(p => p.id === item.id).length;

    const increaseQuantity = () => setCart([...cart, item]);

    const decreaseQuantity = () => {
      const index = cart.findIndex(p => p.id === item.id);
      if (index !== -1) {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
      }
    };

    return (
      <View style={styles.productItem}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Image</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price?.toFixed(2)}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity} disabled={quantityInCart === 0}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityDisplay}>{quantityInCart}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b894" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Products</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentArea}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <FlatList
            data={[{ id: null, name: 'All' }, ...categories]}
            keyExtractor={(item) => item.id?.toString() ?? 'all'}
            renderItem={renderCategory}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Products Grid */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          }
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart', { cart })}
        >
          <Text style={styles.cartText}>Cart ({cart.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  contentArea: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 100,
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  categoryItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginVertical: 6,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  selectedCategoryItem: {
    backgroundColor: '#00b894',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: { padding: 10, flexGrow: 1 },
  productItem: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 5,
    borderRadius: 12,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  productPrice: { fontSize: 14, color: '#333', marginBottom: 10 },
  quantityControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#00b894',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 10,
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '50%',
  },
  cartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#666' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
});

