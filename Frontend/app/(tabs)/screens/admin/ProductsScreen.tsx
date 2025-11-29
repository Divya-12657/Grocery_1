import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://localhost:5000';
// const API_BASE_URL = 'http://51.20.131.174:5000';
const API_BASE_URL = 'https://cartservices.shop';


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  category_id: number;
  image_url: string;
}

interface Category {
  id: number;
  name: string;
}

const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedStock, setEditedStock] = useState('');
  const [editedPrice, setEditedPrice] = useState('');
  
  // Add product states
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');

  // Get auth token with proper Bearer format
  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return { 
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch all products (when no category is selected)
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/products`, { headers });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else {
        Alert.alert('Error', 'Failed to fetch products');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch products by category using the new API endpoint
  const fetchProductsByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/products/category/${categoryId}`, { headers });
      
      if (response.data.products) {
        setProducts(response.data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products by category:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else {
        Alert.alert('Error', 'Failed to fetch products by category');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/categories`, { headers });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else {
        Alert.alert('Error', 'Failed to fetch categories');
      }
    }
  };

  // Create new category
  const createCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API_BASE_URL}/categories`, 
        { name: newCategory.trim() }, 
        { headers }
      );
      
      setNewCategory('');
      setModalVisible(false);
      await fetchCategories();
      Alert.alert('Success', 'Category created successfully');
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else {
        Alert.alert('Error', 'Failed to create category');
      }
    }
  };

  // Add new product
  const addProduct = async () => {
    if (!newProductName.trim() || !newProductPrice.trim() || !newProductStock.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if a category is selected
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category first');
      return;
    }

    const priceNumber = parseFloat(newProductPrice);
    const stockNumber = parseInt(newProductStock);

    if (isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(stockNumber) || stockNumber < 0) {
      Alert.alert('Error', 'Please enter a valid stock number');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.name;
      
      const productData = {
        name: newProductName.trim(),
        description: newProductDescription.trim() || '',
        price: priceNumber,
        stock: stockNumber,
        category: selectedCategoryName,
        image_url: '' // Default empty image URL
      };

      await axios.post(`${API_BASE_URL}/products`, productData, { headers });
      
      // Reset form
      resetAddProductModal();
      setAddProductModalVisible(false);
      
      // Refresh data
      await fetchCategories();
      await fetchProductsByCategory(selectedCategory);
      
      Alert.alert('Success', 'Product added successfully');
    } catch (error) {
      console.error('Error adding product:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else if (error.response?.status === 403) {
        Alert.alert('Permission Error', 'You need admin privileges to add products');
      } else {
        Alert.alert('Error', 'Failed to add product');
      }
    }
  };

  // Update product
  const updateProduct = async () => {
    if (!editedName.trim() || !editedStock.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const stockNumber = parseInt(editedStock);
    if (isNaN(stockNumber) || stockNumber < 0) {
      Alert.alert('Error', 'Please enter a valid stock number');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const updateData: any = {
        name: editedName.trim(),
        stock: stockNumber,
      };

      // Include price if it was edited and is valid
      if (editedPrice.trim()) {
        const priceNumber = parseFloat(editedPrice);
        if (isNaN(priceNumber) || priceNumber < 0) {
          Alert.alert('Error', 'Please enter a valid price');
          return;
        }
        updateData.price = priceNumber;
      }

      await axios.put(`${API_BASE_URL}/products/${editedProduct?.id}`, updateData, { headers });
      
      setEditModalVisible(false);
      resetEditModal();
      
      // Refresh products based on current selection
      if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
      } else {
        await fetchAllProducts();
      }
      
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else {
        Alert.alert('Error', 'Failed to update product');
      }
    }
  };

  // // Delete product
  // const deleteProduct = async (productId: number) => {
  //   console.log('deleteProduct CALLED for ID:', productId);

  //   Alert.alert(
  //     'Confirm Delete',
  //     'Are you sure you want to delete this product?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: async () => {
  //           try {
  //             const headers = await getAuthHeaders();
  //             await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers });
              
  //             // Refresh products
  //             if (selectedCategory) {
  //               await fetchProductsByCategory(selectedCategory);
  //             } else {
  //               await fetchAllProducts();
  //             }
              
  //             Alert.alert('Success', 'Product deleted successfully');
  //           } catch (error) {
  //             console.error('Error deleting product:', error);
  //             if (error.response?.status === 401) {
  //               Alert.alert('Authentication Error', 'Please log in again');
  //             } else {
  //               Alert.alert('Error', 'Failed to delete product');
  //             }
  //           }
  //         },
  //       },
  //     ]
  //   );
  // };

  // const deleteProduct = async (productId: number) => {
  //   console.log('deleteProduct CALLED for ID:', productId);
  //   try {
  //     const headers = await getAuthHeaders();
  //     await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers });
  
  //     // Refresh products
  //     if (selectedCategory) {
  //       await fetchProductsByCategory(selectedCategory);
  //     } else {
  //       await fetchAllProducts();
  //     }
  
  //     Alert.alert('Success', 'Product deleted successfully');
  //   } catch (error) {
  //     if (error.response?.status === 400 && error.response.data.error?.includes('unpaid')) {
  //       Alert.alert('Cannot Delete', 'Product is linked to unpaid orders and cannot be deleted.');
  //     } else {
  //       Alert.alert('Error', 'Failed to delete product');
  //     }
  //   }
  // };
  
  const deleteProduct = async (productId: number) => {
    console.log('deleteProduct CALLED for ID:', productId);
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers });
  
      // Refresh products
      if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
      } else {
        await fetchAllProducts();
      }
  
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error?.response?.data || error.message);
  
      if (
        error.response?.status === 400 &&
        error.response.data?.error?.toLowerCase().includes('unpaid')
      ) {
        Alert.alert(
          'Cannot Delete Product',
          'This product is linked to existing order items and cannot be deleted.'
        );
      } else {
        Alert.alert('Error', 'Failed to delete product. Please try again.');
      }
    }
  };
  
  


  // Handle category selection
  const handleCategorySelect = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === null) {
      // Show all products
      await fetchAllProducts();
    } else {
      // Show products for selected category
      await fetchProductsByCategory(categoryId);
    }
  };

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditedProduct(product);
    setEditedName(product.name);
    setEditedStock(product.stock.toString());
    setEditedPrice(product.price.toString());
    setEditModalVisible(true);
  };

  // Reset edit modal
  const resetEditModal = () => {
    setEditedProduct(null);
    setEditedName('');
    setEditedStock('');
    setEditedPrice('');
  };

  // Reset add product modal
  const resetAddProductModal = () => {
    setNewProductName('');
    setNewProductDescription('');
    setNewProductPrice('');
    setNewProductStock('');
  };

  const cancelEdit = () => {
    setEditModalVisible(false);
    resetEditModal();
  };

  const cancelAddProduct = () => {
    setAddProductModalVisible(false);
    resetAddProductModal();
  };

  // Refresh function for pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      if (selectedCategory) {
        await fetchProductsByCategory(selectedCategory);
      } else {
        await fetchAllProducts();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategory]);

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchCategories();
        await fetchAllProducts();
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Render product item with enhanced actions
  // const renderProduct = ({ item }: { item: Product }) => (
  //   <TouchableOpacity style={styles.productItem} onPress={() => openEditModal(item)}>
  //     <View style={styles.productHeader}>
  //       <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
  //       <TouchableOpacity 
  //         style={styles.deleteButton}
  //         onPress={() => deleteProduct(item.id)}
  //       >
  //         <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
  //       </TouchableOpacity>
  //     </View>
  //     <Text style={styles.productCategory}>{item.category}</Text>
  //     <Text style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
  //     <Text style={[
  //       styles.productStock, 
  //       item.stock <= 5 ? styles.lowStock : styles.normalStock
  //     ]}>
  //       Stock: {item.stock}
  //     </Text>
  //   </TouchableOpacity>
  // );

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <View style={styles.productHeader}>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => openEditModal(item)}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        </TouchableOpacity>
  
        <TouchableOpacity 
          style={styles.deleteButton}
          // style={[styles.deleteButton, { backgroundColor: 'red' }]}

          onPress={() => {
            console.log('Delete called for:', item.id); // Debug log
            deleteProduct(item.id);
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
  
      <Text style={styles.productCategory}>{item.category}</Text>
      <Text style={styles.productPrice}>${item.price?.toFixed(2) || '0.00'}</Text>
      <Text style={[
        styles.productStock,
        item.stock <= 5 ? styles.lowStock : styles.normalStock
      ]}>
        Stock: {item.stock}
      </Text>
    </View>
  );
  

  // Render category button
  const renderCategoryButton = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton, 
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sidebar with categories */}
      <View style={styles.sidebarContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton, 
            styles.allCategoriesButton,
            selectedCategory === null && styles.selectedCategory
          ]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === null && styles.selectedCategoryText
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategoryButton}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle" size={30} color="#00b894" />
            </TouchableOpacity>
          }
        />
      </View>

      {/* Products list */}
      <View style={styles.productsContainer}>
        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>
            {selectedCategory 
              ? categories.find(c => c.id === selectedCategory)?.name || 'Products'
              : 'All Products'
            }
          </Text>
          <TouchableOpacity
            style={[styles.addProductButton, !selectedCategory && styles.disabledButton]}
            onPress={() => {
              if (!selectedCategory) {
                Alert.alert('Select Category', 'Please select a category first to add products');
                return;
              }
              setAddProductModalVisible(true);
            }}
            disabled={!selectedCategory}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00b894" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProduct}
            numColumns={2}
            contentContainerStyle={styles.grid}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00b894']}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {selectedCategory ? 'No products in this category' : 'No products available'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Create Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              value={newCategory}
              onChangeText={setNewCategory}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setModalVisible(false);
                  setNewCategory('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={createCategory}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Product name"
              value={editedName}
              onChangeText={setEditedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="decimal-pad"
              value={editedPrice}
              onChangeText={setEditedPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={editedStock}
              onChangeText={setEditedStock}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={updateProduct}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={addProductModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, styles.largeModalContainer]}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <Text style={styles.categoryInfo}>
              Category: {categories.find(c => c.id === selectedCategory)?.name || 'Unknown'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Product name *"
              value={newProductName}
              onChangeText={setNewProductName}
              autoFocus
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newProductDescription}
              onChangeText={setNewProductDescription}
              multiline
              numberOfLines={2}
            />
            <TextInput
              style={styles.input}
              placeholder="Price *"
              keyboardType="decimal-pad"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock quantity *"
              keyboardType="numeric"
              value={newProductStock}
              onChangeText={setNewProductStock}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelAddProduct}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={addProduct}
              >
                <Text style={styles.saveButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebarContainer: {
    width: 90,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  productsContainer: {
    flex: 1,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addProductButton: {
    backgroundColor: '#00b894',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  categoryInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00b894',
    textAlign: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f9f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00b894',
  },
  categoryButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    alignSelf: 'center',
  },
  allCategoriesButton: {
    backgroundColor: '#e3f2fd',
  },
  selectedCategory: {
    backgroundColor: '#00b894',
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  grid: {
    flexGrow: 1,
    padding: 10,
  },
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
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
  },
  normalStock: {
    color: '#555',
  },
  lowStock: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxWidth: 400,
  },
  largeModalContainer: {
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#00b894',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductsScreen;