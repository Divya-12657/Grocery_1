// // //Start of the category

// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   StyleSheet,
// //   TouchableOpacity,
// //   TextInput,
// //   Modal,
// //   Alert,
// // } from 'react-native';
// // import axios from 'axios';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import CONFIG from '../../../config';

// // export default function ProductsScreen() {
// //   const [products, setProducts] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [selectedCategory, setSelectedCategory] = useState('');
// //   const [newProduct, setNewProduct] = useState({
// //     name: '',
// //     description: '',
// //     price: '',
// //     stock: '',
// //     category: '',
// //   });

// //   // Category modal state
// //   const [modalVisible, setModalVisible] = useState(false);
// //   const [newCategoryName, setNewCategoryName] = useState('');

// //   // Edit modal state
// //   const [editModalVisible, setEditModalVisible] = useState(false);
// //   const [editedProduct, setEditedProduct] = useState({ id: null, name: '', stock: '' });

// //   useEffect(() => {
// //     fetchProducts();
// //     fetchCategories();
// //   }, []);

// //   const fetchProducts = async () => {
// //     try {
// //       const response = await axios.get(`${CONFIG.API_URL}/products`);
// //       setProducts(response.data);
// //     } catch (error) {
// //       alert('Error fetching products');
// //     }
// //   };

// //   const fetchCategories = async () => {
// //     try {
// //       const response = await axios.get(`${CONFIG.API_URL}/categories`);
// //       setCategories(response.data);
// //     } catch (error) {
// //       alert('Error fetching categories');
// //     }
// //   };

// //   const handleAddProduct = async () => {
// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       await axios.post(
// //         `${CONFIG.API_URL}/products`,
// //         {
// //           ...newProduct,
// //           category: selectedCategory,
// //           price: parseFloat(newProduct.price),
// //           stock: parseInt(newProduct.stock),
// //         },
// //         {
// //           headers: { Authorization: token },
// //         }
// //       );
// //       setNewProduct({ name: '', description: '', price: '', stock: '', category: '' });
// //       setSelectedCategory('');
// //       fetchProducts();
// //     } catch (error) {
// //       console.log(error);
// //       alert('Error adding product');
// //     }
// //   };

// //   const handleAddCategory = async () => {
// //     if (!newCategoryName.trim()) {
// //       Alert.alert('Validation', 'Category name cannot be empty');
// //       return;
// //     }
// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       await axios.post(
// //         `${CONFIG.API_URL}/categories`,
// //         { name: newCategoryName },
// //         { headers: { Authorization: token } }
// //       );
// //       setNewCategoryName('');
// //       setModalVisible(false);
// //       fetchCategories();
// //       Alert.alert('Success', 'Category added successfully!');
// //     } catch (error) {
// //       console.log(error);
// //       Alert.alert('Error', 'Failed to add category');
// //     }
// //   };

// //   const handleEditProduct = (product) => {
// //     setEditedProduct({ id: product.id, name: product.name, stock: product.stock.toString() });
// //     setEditModalVisible(true);
// //   };

// //   const handleUpdateProduct = async () => {
// //     try {
// //       const token = await AsyncStorage.getItem('token');
// //       await axios.put(
// //         `${CONFIG.API_URL}/products/${editedProduct.id}`,
// //         {
// //           name: editedProduct.name,
// //           stock: parseInt(editedProduct.stock),
// //         },
// //         {
// //           headers: { Authorization: token },
// //         }
// //       );
// //       setEditModalVisible(false);
// //       fetchProducts();
// //       Alert.alert('Success', 'Product updated successfully!');
// //     } catch (error) {
// //       console.error(error);
// //       Alert.alert('Error', 'Failed to update product');
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.categoryHeader}>
// //         <Text style={styles.sectionTitle}>Select Category:</Text>
// //         <TouchableOpacity
// //           style={styles.plusButton}
// //           onPress={() => setModalVisible(true)}
// //         >
// //           <Text style={styles.plusText}>+</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.categoryContainer}>
// //         {categories.map((cat) => (
// //           <TouchableOpacity
// //             key={cat.id}
// //             style={[
// //               styles.categoryButton,
// //               selectedCategory === cat.name && styles.categoryButtonSelected,
// //             ]}
// //             onPress={() => {
// //               setSelectedCategory(cat.name);
// //               setNewProduct({ ...newProduct, category: cat.name });
// //             }}
// //           >
// //             <Text style={{ color: selectedCategory === cat.name ? '#fff' : '#000' }}>
// //               {cat.name}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       {/* Add Category Modal */}
// //       <Modal
// //         visible={modalVisible}
// //         animationType="slide"
// //         transparent={true}
// //         onRequestClose={() => setModalVisible(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContainer}>
// //             <Text style={styles.modalTitle}>Add New Category</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Category Name"
// //               value={newCategoryName}
// //               onChangeText={setNewCategoryName}
// //             />
// //             <View style={styles.modalButtons}>
// //               <TouchableOpacity
// //                 style={[styles.addButton, { flex: 1, marginRight: 5 }]}
// //                 onPress={handleAddCategory}
// //               >
// //                 <Text style={styles.buttonText}>Add</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
// //                 onPress={() => setModalVisible(false)}
// //               >
// //                 <Text style={styles.buttonText}>Cancel</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Edit Product Modal */}
// //       <Modal
// //         visible={editModalVisible}
// //         animationType="slide"
// //         transparent={true}
// //         onRequestClose={() => setEditModalVisible(false)}
// //       >
// //         <View style={styles.modalOverlay}>
// //           <View style={styles.modalContainer}>
// //             <Text style={styles.modalTitle}>Edit Product</Text>
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Name"
// //               value={editedProduct.name}
// //               onChangeText={(text) => setEditedProduct({ ...editedProduct, name: text })}
// //             />
// //             <TextInput
// //               style={styles.input}
// //               placeholder="Stock"
// //               keyboardType="numeric"
// //               value={editedProduct.stock}
// //               onChangeText={(text) => setEditedProduct({ ...editedProduct, stock: text })}
// //             />
// //             <View style={styles.modalButtons}>
// //               <TouchableOpacity
// //                 style={[styles.addButton, { flex: 1, marginRight: 5 }]}
// //                 onPress={handleUpdateProduct}
// //               >
// //                 <Text style={styles.buttonText}>Update</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity
// //                 style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
// //                 onPress={() => setEditModalVisible(false)}
// //               >
// //                 <Text style={styles.buttonText}>Cancel</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       <View style={styles.addForm}>
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Name"
// //           value={newProduct.name}
// //           onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
// //         />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Description"
// //           value={newProduct.description}
// //           onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
// //         />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Price"
// //           value={newProduct.price}
// //           onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
// //           keyboardType="numeric"
// //         />
// //         <TextInput
// //           style={styles.input}
// //           placeholder="Stock"
// //           value={newProduct.stock}
// //           onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
// //           keyboardType="numeric"
// //         />
// //         <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
// //           <Text style={styles.buttonText}>Add Product</Text>
// //         </TouchableOpacity>
// //       </View>

// //       <FlatList
// //         data={products}
// //         keyExtractor={(item) => item.id.toString()}
// //         renderItem={({ item }) => (
// //           <View style={styles.productCard}>
// //             <Text style={styles.productName}>{item.name}</Text>
// //             <Text>Price: ${item.price}</Text>
// //             <Text>Stock: {item.stock}</Text>
// //             <Text>Category: {item.category}</Text>
// //             <TouchableOpacity
// //               style={[styles.addButton, { marginTop: 5 }]}
// //               onPress={() => handleEditProduct(item)}
// //             >
// //               <Text style={styles.buttonText}>Edit</Text>
// //             </TouchableOpacity>
// //           </View>
// //         )}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, padding: 10 },
// //   categoryHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 5,
// //   },
// //   sectionTitle: { fontSize: 16, fontWeight: 'bold' },
// //   plusButton: {
// //     backgroundColor: '#4CAF50',
// //     borderRadius: 20,
// //     width: 30,
// //     height: 30,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   plusText: { color: '#fff', fontSize: 22, fontWeight: 'bold', lineHeight: 24 },
// //   categoryContainer: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     marginBottom: 10,
// //   },
// //   categoryButton: {
// //     borderWidth: 1,
// //     borderColor: '#ccc',
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     borderRadius: 20,
// //     marginRight: 8,
// //     marginBottom: 8,
// //     backgroundColor: '#f0f0f0',
// //   },
// //   categoryButtonSelected: { backgroundColor: '#4CAF50' },
// //   addForm: {
// //     backgroundColor: '#fff',
// //     padding: 10,
// //     borderRadius: 5,
// //     marginBottom: 10,
// //   },
// //   input: {
// //     borderWidth: 1,
// //     borderColor: '#ddd',
// //     padding: 10,
// //     marginBottom: 10,
// //     borderRadius: 5,
// //   },
// //   addButton: {
// //     backgroundColor: '#4CAF50',
// //     padding: 15,
// //     borderRadius: 5,
// //     alignItems: 'center',
// //   },
// //   cancelButton: {
// //     backgroundColor: '#888',
// //     padding: 15,
// //     borderRadius: 5,
// //     alignItems: 'center',
// //   },
// //   buttonText: { color: '#fff', fontSize: 16 },
// //   productCard: {
// //     backgroundColor: '#fff',
// //     padding: 10,
// //     marginBottom: 10,
// //     borderRadius: 5,
// //   },
// //   productName: { fontSize: 16, fontWeight: 'bold' },
// //   modalOverlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.4)',
// //     justifyContent: 'center',
// //     padding: 20,
// //   },
// //   modalContainer: {
// //     backgroundColor: '#fff',
// //     borderRadius: 8,
// //     padding: 20,
// //   },
// //   modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
// //   modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
// // });


// ///jhjhbjh

// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Modal,
//   Alert,
// } from 'react-native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CONFIG from '../../../config';

// export default function ProductsScreen() {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [newProduct, setNewProduct] = useState({
//     name: '',
//     description: '',
//     price: '',
//     stock: '',
//     category: '',
//   });

//   // Category modal state
//   const [modalVisible, setModalVisible] = useState(false);
//   const [newCategoryName, setNewCategoryName] = useState('');

//   // Edit modal state
//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [editedProduct, setEditedProduct] = useState({ 
//     id: null, 
//     name: '', 
//     description: '',
//     price: '',
//     stock: '' 
//   });

//   useEffect(() => {
//     fetchProducts();
//     fetchCategories();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(`${CONFIG.API_URL}/products`);
//       setProducts(response.data);
//     } catch (error) {
//       alert('Error fetching products');
//     }
//   };

//   const fetchCategories = async () => {
//     try {
//       const response = await axios.get(`${CONFIG.API_URL}/categories`);
//       setCategories(response.data);
//     } catch (error) {
//       alert('Error fetching categories');
//     }
//   };

//   const handleAddProduct = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
      
//       // Validate required fields
//       if (!newProduct.name || !newProduct.price || !newProduct.stock) {
//         Alert.alert('Validation Error', 'Name, price and stock are required');
//         return;
//       }
      
//       await axios.post(
//         `${CONFIG.API_URL}/products`,
//         {
//           ...newProduct,
//           category: selectedCategory,
//           price: parseFloat(newProduct.price),
//           stock: parseInt(newProduct.stock),
//         },
//         {
//           headers: { Authorization: token },
//         }
//       );
//       setNewProduct({ name: '', description: '', price: '', stock: '', category: '' });
//       setSelectedCategory('');
//       fetchProducts();
//       Alert.alert('Success', 'Product added successfully!');
//     } catch (error) {
//       console.log(error.response || error);
//       alert('Error adding product: ' + (error.response?.data?.message || error.message));
//     }
//   };

//   const handleAddCategory = async () => {
//     if (!newCategoryName.trim()) {
//       Alert.alert('Validation', 'Category name cannot be empty');
//       return;
//     }
//     try {
//       const token = await AsyncStorage.getItem('token');
//       await axios.post(
//         `${CONFIG.API_URL}/categories`,
//         { name: newCategoryName },
//         { headers: { Authorization: token } }
//       );
//       setNewCategoryName('');
//       setModalVisible(false);
//       fetchCategories();
//       Alert.alert('Success', 'Category added successfully!');
//     } catch (error) {
//       console.log(error.response || error);
//       Alert.alert('Error', `Failed to add category: ${error.response?.data?.message || error.message}`);
//     }
//   };

//   const handleEditProduct = (product) => {
//     setEditedProduct({ 
//       id: product.id, 
//       name: product.name,
//       description: product.description || '',
//       price: product.price.toString(),
//       stock: product.stock.toString() 
//     });
//     setEditModalVisible(true);
//   };

//   const handleUpdateProduct = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
      
//       if (!editedProduct.name) {
//         Alert.alert('Validation Error', 'Product name is required');
//         return;
//       }
      
//       console.log('Updating product:', editedProduct);
      
//       await axios.put(
//         `${CONFIG.API_URL}/products/${editedProduct.id}`,
//         {
//           name: editedProduct.name,
//           description: editedProduct.description,
//           price: parseFloat(editedProduct.price),
//           stock: parseInt(editedProduct.stock),
//         },
//         {
//           headers: { Authorization: token },
//         }
//       );
//       setEditModalVisible(false);
//       fetchProducts();
//       Alert.alert('Success', 'Product updated successfully!');
//     } catch (error) {
//       console.error('Update error:', error.response || error);
//       Alert.alert('Error', `Failed to update product: ${error.response?.data?.message || error.message}`);
//     }
//   };
  
//   const handleDeleteProduct = async (productId) => {
//     console.log('Delete button pressed for product ID:', productId);
    
//     Alert.alert(
//       'Confirm Delete',
//       'Are you sure you want to delete this product?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               console.log('Deleting product with ID:', productId);
//               const token = await AsyncStorage.getItem('token');
              
//               if (!token) {
//                 console.error('No authentication token found');
//                 Alert.alert('Error', 'Authentication required');
//                 return;
//               }
              
//               console.log('Sending delete request to:', `${CONFIG.API_URL}/products/${productId}`);
//               const response = await axios.delete(
//                 `${CONFIG.API_URL}/products/${productId}`,
//                 {
//                   headers: { Authorization: token },
//                 }
//               );
              
//               console.log('Delete response:', response.data);
//               fetchProducts();
//               Alert.alert('Success', 'Product deleted successfully!');
//             } catch (error) {
//               console.error('Delete error:', error.response || error);
//               Alert.alert('Error', `Failed to delete product: ${error.response?.data?.message || error.message}`);
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.categoryHeader}>
//         <Text style={styles.sectionTitle}>Select Category:</Text>
//         <TouchableOpacity
//           style={styles.plusButton}
//           onPress={() => setModalVisible(true)}
//         >
//           <Text style={styles.plusText}>+</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.categoryContainer}>
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.id}
//             style={[
//               styles.categoryButton,
//               selectedCategory === cat.name && styles.categoryButtonSelected,
//             ]}
//             onPress={() => {
//               setSelectedCategory(cat.name);
//               setNewProduct({ ...newProduct, category: cat.name });
//             }}
//           >
//             <Text style={{ color: selectedCategory === cat.name ? '#fff' : '#000' }}>
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Add Category Modal */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Add New Category</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Category Name"
//               value={newCategoryName}
//               onChangeText={setNewCategoryName}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.addButton, { flex: 1, marginRight: 5 }]}
//                 onPress={handleAddCategory}
//               >
//                 <Text style={styles.buttonText}>Add</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
//                 onPress={() => setModalVisible(false)}
//               >
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Edit Product Modal */}
//       <Modal
//         visible={editModalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Edit Product</Text>
            
//             <Text style={styles.fieldLabel}>Name:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Name"
//               value={editedProduct.name}
//               onChangeText={(text) => setEditedProduct({ ...editedProduct, name: text })}
//             />
            
//             <Text style={styles.fieldLabel}>Description:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Description"
//               value={editedProduct.description}
//               onChangeText={(text) => setEditedProduct({ ...editedProduct, description: text })}
//             />
            
//             <Text style={styles.fieldLabel}>Price:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Price"
//               keyboardType="numeric"
//               value={editedProduct.price}
//               onChangeText={(text) => setEditedProduct({ ...editedProduct, price: text })}
//             />
            
//             <Text style={styles.fieldLabel}>Stock:</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Stock"
//               keyboardType="numeric"
//               value={editedProduct.stock}
//               onChangeText={(text) => setEditedProduct({ ...editedProduct, stock: text })}
//             />
            
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.addButton, { flex: 1, marginRight: 5 }]}
//                 onPress={handleUpdateProduct}
//               >
//                 <Text style={styles.buttonText}>Update</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
//                 onPress={() => setEditModalVisible(false)}
//               >
//                 <Text style={styles.buttonText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Text style={styles.sectionTitle}>Add New Product</Text>
//       <View style={styles.addForm}>
//         <View style={styles.formRow}>
//           <Text style={styles.fieldLabel}>Name:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Product Name"
//             value={newProduct.name}
//             onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
//           />
//         </View>
        
//         <View style={styles.formRow}>
//           <Text style={styles.fieldLabel}>Description:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Product Description"
//             value={newProduct.description}
//             onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
//           />
//         </View>
        
//         <View style={styles.formRow}>
//           <Text style={styles.fieldLabel}>Price:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Product Price"
//             value={newProduct.price}
//             onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
//             keyboardType="numeric"
//           />
//         </View>
        
//         <View style={styles.formRow}>
//           <Text style={styles.fieldLabel}>Stock:</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Product Stock"
//             value={newProduct.stock}
//             onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
//             keyboardType="numeric"
//           />
//         </View>
        
//         <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
//           <Text style={styles.buttonText}>Add Product</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.sectionTitle}>Product List</Text>
//       <FlatList
//         data={products}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.productCard}>
//             <Text style={styles.productName}>{item.name}</Text>
//             <Text style={styles.productDetail}>Price: ${item.price}</Text>
//             <Text style={styles.productDetail}>Stock: {item.stock}</Text>
//             <Text style={styles.productDetail}>Category: {item.category}</Text>
//             <View style={styles.productActions}>
//               <TouchableOpacity
//                 style={[styles.actionButton, styles.editButton]}
//                 onPress={() => handleEditProduct(item)}
//               >
//                 <Text style={styles.buttonText}>Edit</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.actionButton, styles.deleteButton]}
//                 onPress={() => handleDeleteProduct(item.id)}
//               >
//                 <Text style={styles.buttonText}>Delete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     padding: 10 
//   },
//   categoryHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 5,
//   },
//   sectionTitle: { 
//     fontSize: 18, 
//     fontWeight: 'bold',
//     marginVertical: 10
//   },
//   plusButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 20,
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   plusText: { 
//     color: '#fff', 
//     fontSize: 22, 
//     fontWeight: 'bold', 
//     lineHeight: 24 
//   },
//   categoryContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 10,
//   },
//   categoryButton: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   categoryButtonSelected: { 
//     backgroundColor: '#4CAF50' 
//   },
//   addForm: {
//     backgroundColor: '#fff',
//     padding: 10,
//     borderRadius: 5,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   formRow: {
//     marginBottom: 8,
//   },
//   fieldLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     marginBottom: 4,
//     color: '#333',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 10,
//     marginBottom: 10,
//     borderRadius: 5,
//     backgroundColor: '#f9f9f9',
//   },
//   addButton: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#888',
//     padding: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   buttonText: { 
//     color: '#fff', 
//     fontSize: 16,
//     fontWeight: '500'
//   },
//   productCard: {
//     backgroundColor: '#fff',
//     padding: 12,
//     marginBottom: 10,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     elevation: 1,
//   },
//   productName: { 
//     fontSize: 18, 
//     fontWeight: 'bold',
//     marginBottom: 5
//   },
//   productDetail: {
//     fontSize: 14,
//     marginBottom: 3,
//     color: '#333'
//   },
//   productActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     marginTop: 10,
//   },
//   actionButton: {
//     padding: 8,
//     borderRadius: 5,
//     alignItems: 'center',
//     marginRight: 10,
//     minWidth: 80,
//   },
//   editButton: {
//     backgroundColor: '#2196F3',
//   },
//   deleteButton: {
//     backgroundColor: '#F44336',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   modalTitle: { 
//     fontSize: 20, 
//     fontWeight: 'bold', 
//     marginBottom: 15,
//     textAlign: 'center'
//   },
//   modalButtons: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between',
//     marginTop: 10
//   },
// });


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../../../config';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ id: null, name: '', stock: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      alert('Error fetching products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      alert('Error fetching categories');
    }
  };

  const handleAddProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${CONFIG.API_URL}/products`,
        {
          ...newProduct,
          category: selectedCategory,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
        },
        {
          headers: { Authorization: token },
        }
      );
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '' });
      setSelectedCategory('');
      fetchProducts();
    } catch (error) {
      console.log(error);
      alert('Error adding product');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Validation', 'Category name cannot be empty');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${CONFIG.API_URL}/categories`,
        { name: newCategoryName },
        { headers: { Authorization: token } }
      );
      setNewCategoryName('');
      setModalVisible(false);
      fetchCategories();
      Alert.alert('Success', 'Category added successfully!');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleEditProduct = (product) => {
    setEditedProduct({ id: product.id, name: product.name, stock: product.stock.toString() });
    setEditModalVisible(true);
  };

  const handleUpdateProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${CONFIG.API_URL}/products/${editedProduct.id}`,
        {
          name: editedProduct.name,
          stock: parseInt(editedProduct.stock),
        },
        {
          headers: { Authorization: token },
        }
      );
      setEditModalVisible(false);
      fetchProducts();
      Alert.alert('Success', 'Product updated successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`${CONFIG.API_URL}/products/${productId}`, {
        headers: { Authorization: token },
      });
      fetchProducts();
      Alert.alert('Deleted', 'Product deleted successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryHeader}>
        <Text style={styles.sectionTitle}>Select Category:</Text>
        <TouchableOpacity style={styles.plusButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              selectedCategory === cat.name && styles.categoryButtonSelected,
            ]}
            onPress={() => {
              setSelectedCategory(cat.name);
              setNewProduct({ ...newProduct, category: cat.name });
            }}
          >
            <Text style={{ color: selectedCategory === cat.name ? '#fff' : '#000' }}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Category Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 5 }]} onPress={handleAddCategory}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Product</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editedProduct.name}
              onChangeText={(text) => setEditedProduct({ ...editedProduct, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={editedProduct.stock}
              onChangeText={(text) => setEditedProduct({ ...editedProduct, stock: text })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 5 }]} onPress={handleUpdateProduct}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Product Form */}
      <View style={styles.addForm}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={newProduct.name}
          onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newProduct.description}
          onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={newProduct.price}
          onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Stock"
          value={newProduct.stock}
          onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text>Price: ${item.price}</Text>
            <Text>Stock: {item.stock}</Text>
            <Text>Category: {item.category}</Text>

            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.addButton, { flex: 1, marginRight: 5 }]}
                onPress={() => handleEditProduct(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
                onPress={() =>
                  Alert.alert(
                    'Confirm Delete',
                    'Are you sure you want to delete this product?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteProduct(item.id) },
                    ]
                  )
                }
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  plusButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: { color: '#fff', fontSize: 22, fontWeight: 'bold', lineHeight: 24 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonSelected: { backgroundColor: '#4CAF50' },
  addForm: { backgroundColor: '#fff', padding: 10, borderRadius: 5, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
  addButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 5 },
  cancelButton: { backgroundColor: '#f44336', padding: 12, borderRadius: 5 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  productCard: { backgroundColor: '#fff', padding: 15, borderRadius: 5, marginBottom: 10, elevation: 2 },
  productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
});
