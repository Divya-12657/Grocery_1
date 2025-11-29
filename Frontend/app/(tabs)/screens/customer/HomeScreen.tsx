// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   Linking,
//   Modal,
//   TextInput,
//   ScrollView,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Image,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import axios from 'axios';
// import CONFIG from '../../../config';
// import { AuthContext } from '../../AuthContext';
// import { CartContext } from './CartContext';



// const screenWidth = Dimensions.get('window').width;
// const productItemWidth = (screenWidth - 60) / 2;

// export default function HomeScreen({ navigation }) {
//   const { logout, user } = useContext(AuthContext);
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   // const [cart, setCart] = useState([]);
//   // const { cart, setCart } = useContext(CartContext);
//   const [loading, setLoading] = useState(true);
//   const [requestModalVisible, setRequestModalVisible] = useState(false);
//   const [requestedItem, setRequestedItem] = useState('');
//   const [showLogout, setShowLogout] = useState(false);
//   const categoryScrollRef = useRef(null);
//   const { cart, addItem, removeItem } = useContext(CartContext);
  

//   const WHATSAPP_CONFIG = {
//     phoneNumber: '+919945277470',
//     defaultMessage: 'Hi! I need help with my grocery order.',
//   };

//   // Improved image URL handler - works with both relative and absolute URLs
//   const getImageUrl = (imageUrl) => {
//     if (!imageUrl) return null;
    
//     // If it's already a complete URL (starts with http/https), use it as is
//     if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//       return imageUrl;
//     }
    
//     // If it's a relative path, construct the full URL
//     // Remove leading slash if present to avoid double slashes
//     const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
//     return `${CONFIG.API_URL}/${cleanPath}`;
//   };

//   useEffect(() => {
//     fetchCategories();
//     fetchProducts();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const res = await axios.get(`${CONFIG.API_URL}/categories`);
//       setCategories(res.data || []);
//     } catch (err) {
//       console.error('Error fetching categories:', err);
//     }
//   };

//   const fetchProducts = async (categoryId = null) => {
//     try {
//       setLoading(true);
//       const url = categoryId
//         ? `${CONFIG.API_URL}/products/category/${categoryId}`
//         : `${CONFIG.API_URL}/products`;
//       const res = await axios.get(url);
//       setProducts(res.data.products || res.data || []);
//     } catch (err) {
//       console.error('Error fetching products:', err);
//       Alert.alert('Error', 'Failed to fetch products');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     setShowLogout(false);
//     logout(navigation);
//   };

//   const handleRequestSubmit = () => {
//     if (!requestedItem.trim()) {
//       Alert.alert('Please enter the product name');
//       return;
//     }
//     const message = encodeURIComponent(
//       `Hi, I'm looking for "${requestedItem}" which is not available.`
//     );
//     const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
//     const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace(
//       '+',
//       ''
//     )}?text=${message}`;
//     Linking.openURL(whatsappUrl).catch(() => Linking.openURL(whatsappWebUrl));
//     setRequestModalVisible(false);
//     setRequestedItem('');
//   };

//   const goToPastOrders = () => {
//     navigation.navigate('PastOrders', { userId: user?.id });
//     setShowLogout(false);
//   };

//   const categoryList = [{ id: null, name: 'All' }, ...categories];

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#667eea" />
//       {/* Header with Gradient */}
//       <LinearGradient
//         colors={['#667eea', '#764ba2']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 1 }}
//         style={styles.headerGradient}
//       >
//         <View style={styles.header}>
//           <Text style={styles.headerText}>Grocery Market</Text>
//           <Text style={styles.headerSubtext}>Quality products at your doorstep</Text>
//         </View>
//       </LinearGradient>
      
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Action Buttons with improved design */}
//         <View style={styles.actionContainer}>
//           <TouchableOpacity 
//             style={[styles.actionButton, styles.whatsappButton]} 
//             onPress={() => {
//               const message = encodeURIComponent(WHATSAPP_CONFIG.defaultMessage);
//               const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
//               const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace('+', '')}?text=${message}`;

//               Linking.canOpenURL(whatsappUrl)
//                 .then((supported) => supported ? Linking.openURL(whatsappUrl) : Linking.openURL(whatsappWebUrl))
//                 .catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
//             }}
//           >
//             <View style={styles.buttonContent}>
//               <Text style={styles.buttonIcon}>💬</Text>
//               <Text style={styles.buttonText}>Support</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.actionButton, styles.requestButton]} 
//             onPress={() => setRequestModalVisible(true)}
//           >
//             <View style={styles.buttonContent}>
//               <Text style={styles.buttonIcon}>➕</Text>
//               <Text style={styles.buttonText}>Request</Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.actionButton, styles.profileButton]} 
//             onPress={() => navigation.navigate('Profile')}
//           >
//             <View style={styles.buttonContent}>
//               <Text style={styles.buttonIcon}>👤</Text>
//               <Text style={styles.buttonText}>Profile</Text>
//             </View>
//           </TouchableOpacity>
//         </View>

//         {/* Profile Dropdown */}
//         {showLogout && (
//           <View style={styles.profileDropdown}>
//             <TouchableOpacity onPress={goToPastOrders} style={styles.profileOption}>
//               <Text style={styles.dropdownText}>📦 Past Orders</Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={handleLogout} style={styles.profileOption}>
//               <Text style={styles.dropdownText}>🚪 Logout</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Categories Section */}
//         <View style={styles.categoriesSection}>
//           <Text style={styles.sectionTitle}>Categories</Text>
//           <ScrollView
//             ref={categoryScrollRef}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={{ paddingHorizontal: 20 }}
//             style={styles.categoryScroll}
//           >
//             {categoryList.map((item, index) => (
//               <TouchableOpacity
//                 key={item.id ?? 'all'}
//                 style={[
//                   styles.categoryPill,
//                   selectedCategory === item.id && styles.categoryPillSelected,
//                 ]}
//                 onPress={() => {
//                   setSelectedCategory(item.id);
//                   fetchProducts(item.id);
//                   const pillWidth = 100;
//                   const scrollPosition = Math.max(0, index * pillWidth - 50);
//                   categoryScrollRef.current?.scrollTo({
//                     x: scrollPosition,
//                     animated: true,
//                   });
//                 }}
//               >
//                 {selectedCategory === item.id ? (
//                   <LinearGradient
//                     colors={['#ff6b6b', '#ee5a24']}
//                     style={styles.categoryGradient}
//                   >
//                     <Text style={styles.categoryTextSelected}>{item.name}</Text>
//                   </LinearGradient>
//                 ) : (
//                   <Text style={styles.categoryText}>{item.name}</Text>
//                 )}
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Products Grid */}
//         <View style={styles.productsSection}>
//           <Text style={styles.sectionTitle}>Products</Text>
//           <View style={styles.grid}>
//             {products.map((item) => {
//               const quantityInCart = cart.filter((p) => p.id === item.id).length;
              
//               const imageUrl = getImageUrl(item.image_url);
              
//               return (
//                 <View
//                   key={item.id}
//                   style={[styles.productItem, { width: productItemWidth }]}
//                 >
//                   <View style={styles.imagePlaceholder}>
//                     {imageUrl ? (
//                       <Image
//                         source={{ uri: imageUrl }}
//                         style={styles.productImage}
//                         resizeMode="cover"
//                         onError={(error) => {
//                           console.log(`Image failed to load: ${imageUrl}`, error.nativeEvent.error);
//                         }}
//                         onLoad={() => {
//                           console.log(`Image loaded successfully: ${imageUrl}`);
//                         }}
//                       />
//                     ) : (
//                       <LinearGradient
//                         colors={['#a8edea', '#fed6e3']}
//                         style={styles.imageGradient}
//                       >
//                         <Text style={styles.placeholderText}>🛍️</Text>
//                       </LinearGradient>
//                     )}
//                   </View>
                  
//                   <View style={styles.productInfo}>
//                     <Text style={styles.productName} numberOfLines={2}>
//                       {item.name}
//                     </Text>
//                     <Text style={styles.productPrice}>₹{item.price?.toFixed(2)}</Text>
//                   </View>
                  
//                   <View style={styles.quantityControls}>
//                     <TouchableOpacity
//                       style={[
//                         styles.quantityButton,
//                         quantityInCart === 0 && styles.quantityButtonDisabled,
//                       ]}
//                       onPress={() => {
//                         const index = cart.findIndex((p) => p.id === item.id);
//                         if (index !== -1) {
//                           const updatedCart = [...cart];
//                           updatedCart.splice(index, 1);
//                           setCart(updatedCart);
//                         }
//                       }}
//                       // onPress={() => removeItem(item.id)}

//                       disabled={quantityInCart === 0}
//                     >
//                       <Text
//                         style={[
//                           styles.quantityButtonText,
//                           quantityInCart === 0 &&
//                             styles.quantityButtonTextDisabled,
//                         ]}
//                       >
//                         −
//                       </Text>
//                     </TouchableOpacity>
                    
//                     <View style={styles.quantityDisplay}>
//                       <Text style={styles.quantityText}>{quantityInCart}</Text>
//                     </View>
                    
//                     <TouchableOpacity
//                       style={[styles.quantityButton,
//                       quantityInCart === 0 && styles.quantityButtonDisabled,
//                       ]}
//                       // onPress={() => setCart([...cart, item])}
//                       onPress={() => addItem(item)}
//                     >
//                       <LinearGradient
//                         colors={['#00b894', '#00a085']}
//                         style={styles.quantityButtonGradient}
//                       >
//                         <Text style={styles.quantityButtonText}>+</Text>
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         </View>
//       </ScrollView>

//       {/* Floating Cart Button with enhanced design */}
//       <TouchableOpacity
//         style={styles.floatingCartButton}
//         // onPress={() => navigation.navigate('Cart', { cart })}
//         onPress={() => navigation.navigate('Cart')}

//       >
//         <LinearGradient
//           colors={['#4CAF50', '#45a049']}
//           style={styles.cartGradient}
//         >
//           <Text style={styles.cartIcon}>🛒</Text>
//           <View style={styles.cartBadge}>
//             <Text style={styles.cartBadgeText}>{cart.length}</Text>
//           </View>
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Enhanced Modal */}
//       <Modal 
//         visible={requestModalVisible} 
//         animationType="slide" 
//         transparent 
//         onRequestClose={() => setRequestModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <LinearGradient
//               colors={['#667eea', '#764ba2']}
//               style={styles.modalHeader}
//             >
//               <Text style={styles.modalTitle}>Request an Item</Text>
//               <Text style={styles.modalSubtitle}>Can't find what you're looking for?</Text>
//             </LinearGradient>
            
//             <View style={styles.modalBody}>
//               <TextInput
//                 placeholder="Enter item name (e.g., Organic Apples)"
//                 value={requestedItem}
//                 onChangeText={setRequestedItem}
//                 style={styles.input}
//                 placeholderTextColor="#999"
//               />
              
//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={styles.modalButton} 
//                   onPress={handleRequestSubmit}
//                 >
//                   <LinearGradient
//                     colors={['#00b894', '#00a085']}
//                     style={styles.modalButtonGradient}
//                   >
//                     <Text style={styles.modalButtonText}>Send Request</Text>
//                   </LinearGradient>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.modalCancelButton}
//                   onPress={() => setRequestModalVisible(false)}
//                 >
//                   <Text style={styles.modalCancelText}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   headerGradient: {
//     paddingTop: 20,
//     paddingBottom: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 10,
//   },
//   headerText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   headerSubtext: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//     textAlign: 'center',
//     marginTop: 5,
//   },
//   actionContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   actionButton: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     minWidth: 90,
//   },
//   whatsappButton: {
//     backgroundColor: '#25D366',
//   },
//   requestButton: {
//     backgroundColor: '#ff6b6b',
//   },
//   profileButton: {
//     backgroundColor: '#74b9ff',
//   },
//   buttonContent: {
//     alignItems: 'center',
//   },
//   buttonIcon: {
//     fontSize: 20,
//     marginBottom: 5,
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   profileDropdown: {
//     position: 'absolute',
//     top: 120,
//     right: 20,
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 10,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     zIndex: 1000,
//     minWidth: 150,
//   },
//   profileOption: {
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   dropdownText: {
//     fontSize: 16,
//     color: '#2d3436',
//     fontWeight: '500',
//   },
//   categoriesSection: {
//     marginTop: 20,
//   },
//   productsSection: {
//     marginTop: 10,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#2d3436',
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },
//   categoryScroll: {
//     maxHeight: 60,
//   },
//   categoryPill: {
//     marginRight: 12,
//     borderRadius: 25,
//     backgroundColor: '#fff',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   categoryPillSelected: {
//     elevation: 4,
//   },
//   categoryGradient: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 25,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   categoryText: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     textAlign: 'center',
//   },
//   categoryTextSelected: {
//     fontSize: 14,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//   },
//   productItem: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 15,
//     marginBottom: 20,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   imagePlaceholder: {
//     width: '100%',
//     height: 120,
//     borderRadius: 15,
//     marginBottom: 12,
//     overflow: 'hidden',
//   },
//   imageGradient: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   placeholderText: {
//     fontSize: 40,
//   },
//   productImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 15,
//   },
//   productInfo: {
//     marginBottom: 15,
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2d3436',
//     marginBottom: 5,
//     lineHeight: 20,
//   },
//   productPrice: {
//     fontSize: 18,
//     color: '#00b894',
//     fontWeight: 'bold',
//   },
//   quantityControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 25,
//     padding: 5,
//   },
//   quantityButton: {
//     width: 35,
//     height: 35,
//     borderRadius: 17.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#e9ecef',
//   },
//   quantityButtonDisabled: {
//     backgroundColor: '#e9ecef',
//   },
//   quantityButtonGradient: {
//     width: 35,
//     height: 35,
//     borderRadius: 17.5,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   quantityButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 18,
//   },
//   quantityButtonTextDisabled: {
//     color: '#adb5bd',
//   },
//   quantityDisplay: {
//     backgroundColor: '#fff',
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 15,
//   },
//   quantityText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2d3436',
//   },
//   floatingCartButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     borderRadius: 30,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   cartGradient: {
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cartIcon: {
//     fontSize: 24,
//     marginRight: 10,
//   },
//   cartBadge: {
//     backgroundColor: '#ff6b6b',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     minWidth: 24,
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     width: '100%',
//     maxWidth: 400,
//     borderRadius: 20,
//     overflow: 'hidden',
//     elevation: 10,
//   },
//   modalHeader: {
//     padding: 25,
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 5,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: 'rgba(255,255,255,0.8)',
//   },
//   modalBody: {
//     padding: 25,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//     borderRadius: 15,
//     padding: 15,
//     fontSize: 16,
//     backgroundColor: '#f8f9fa',
//     marginBottom: 25,
//   },
//   modalActions: {
//     gap: 15,
//   },
//   modalButton: {
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   modalButtonGradient: {
//     padding: 15,
//     alignItems: 'center',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalCancelButton: {
//     padding: 15,
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 15,
//   },
//   modalCancelText: {
//     color: '#666',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';
import { CartContext } from './CartContext';

const screenWidth = Dimensions.get('window').width;
const productItemWidth = (screenWidth - 60) / 2;

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestedItem, setRequestedItem] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const categoryScrollRef = useRef(null);
  
  // ✅ Get cart functions from CartContext
  const { cart, addItem, removeItem } = useContext(CartContext);
  
  const WHATSAPP_CONFIG = {
    phoneNumber: '+919945277470',
    defaultMessage: 'Hi! I need help with my grocery order.',
  };

  // Improved image URL handler - works with both relative and absolute URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a complete URL (starts with http/https), use it as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path, construct the full URL
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
    return `${CONFIG.API_URL}/${cleanPath}`;
  };

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

  const handleLogout = () => {
    setShowLogout(false);
    logout(navigation);
  };

  const handleRequestSubmit = () => {
    if (!requestedItem.trim()) {
      Alert.alert('Please enter the product name');
      return;
    }
    const message = encodeURIComponent(
      `Hi, I'm looking for "${requestedItem}" which is not available.`
    );
    const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
    const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace(
      '+',
      ''
    )}?text=${message}`;
    Linking.openURL(whatsappUrl).catch(() => Linking.openURL(whatsappWebUrl));
    setRequestModalVisible(false);
    setRequestedItem('');
  };

  const goToPastOrders = () => {
    navigation.navigate('PastOrders', { userId: user?.id });
    setShowLogout(false);
  };

  const categoryList = [{ id: null, name: 'All' }, ...categories];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Grocery Market</Text>
          <Text style={styles.headerSubtext}>Quality products at your doorstep</Text>
        </View>
      </LinearGradient>
      
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Buttons with improved design */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.whatsappButton]} 
            onPress={() => {
              const message = encodeURIComponent(WHATSAPP_CONFIG.defaultMessage);
              const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
              const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace('+', '')}?text=${message}`;

              Linking.canOpenURL(whatsappUrl)
                .then((supported) => supported ? Linking.openURL(whatsappUrl) : Linking.openURL(whatsappWebUrl))
                .catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
            }}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>💬</Text>
              <Text style={styles.buttonText}>Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.requestButton]} 
            onPress={() => setRequestModalVisible(true)}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>➕</Text>
              <Text style={styles.buttonText}>Request</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.profileButton]} 
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>👤</Text>
              <Text style={styles.buttonText}>Profile</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile Dropdown */}
        {showLogout && (
          <View style={styles.profileDropdown}>
            <TouchableOpacity onPress={goToPastOrders} style={styles.profileOption}>
              <Text style={styles.dropdownText}>📦 Past Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.profileOption}>
              <Text style={styles.dropdownText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            style={styles.categoryScroll}
          >
            {categoryList.map((item, index) => (
              <TouchableOpacity
                key={item.id ?? 'all'}
                style={[
                  styles.categoryPill,
                  selectedCategory === item.id && styles.categoryPillSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  fetchProducts(item.id);
                  const pillWidth = 100;
                  const scrollPosition = Math.max(0, index * pillWidth - 50);
                  categoryScrollRef.current?.scrollTo({
                    x: scrollPosition,
                    animated: true,
                  });
                }}
              >
                {selectedCategory === item.id ? (
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a24']}
                    style={styles.categoryGradient}
                  >
                    <Text style={styles.categoryTextSelected}>{item.name}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.categoryText}>{item.name}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.grid}>
            {products.map((item) => {
              const quantityInCart = cart.filter((p) => p.id === item.id).length;
              const imageUrl = getImageUrl(item.image_url);
              
              return (
                <View
                  key={item.id}
                  style={[styles.productItem, { width: productItemWidth }]}
                >
                  <View style={styles.imagePlaceholder}>
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                        onError={(error) => {
                          console.log(`Image failed to load: ${imageUrl}`, error.nativeEvent.error);
                        }}
                        onLoad={() => {
                          console.log(`Image loaded successfully: ${imageUrl}`);
                        }}
                      />
                    ) : (
                      <LinearGradient
                        colors={['#a8edea', '#fed6e3']}
                        style={styles.imageGradient}
                      >
                        <Text style={styles.placeholderText}>🛍️</Text>
                      </LinearGradient>
                    )}
                  </View>
                  
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.productPrice}>₹{item.price?.toFixed(2)}</Text>
                  </View>
                  
                  {/* ✅ CORRECTED QUANTITY CONTROLS */}
                  <View style={styles.quantityControls}>
                    {/* MINUS BUTTON - Removes one item from cart */}
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantityInCart === 0 && styles.quantityButtonDisabled,
                      ]}
                      onPress={() => removeItem(item.id)}
                      disabled={quantityInCart === 0}
                    >
                      <Text
                        style={[
                          styles.quantityButtonText,
                          quantityInCart === 0 && styles.quantityButtonTextDisabled,
                        ]}
                      >
                        −
                      </Text>
                    </TouchableOpacity>
                    
                    {/* QUANTITY DISPLAY */}
                    <View style={styles.quantityDisplay}>
                      <Text style={styles.quantityText}>{quantityInCart}</Text>
                    </View>
                    
                    {/* PLUS BUTTON - Adds one item to cart */}
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => addItem(item)}
                    >
                      <LinearGradient
                        colors={['#00b894', '#00a085']}
                        style={styles.quantityButtonGradient}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ✅ CORRECTED FLOATING CART BUTTON - No cart param passed */}
      <TouchableOpacity
        style={styles.floatingCartButton}
        onPress={() => navigation.navigate('Cart')}
      >
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.cartGradient}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cart.length}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Enhanced Modal */}
      <Modal 
        visible={requestModalVisible} 
        animationType="slide" 
        transparent 
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Request an Item</Text>
              <Text style={styles.modalSubtitle}>Can't find what you're looking for?</Text>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <TextInput
                placeholder="Enter item name (e.g., Organic Apples)"
                value={requestedItem}
                onChangeText={setRequestedItem}
                style={styles.input}
                placeholderTextColor="#999"
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleRequestSubmit}
                >
                  <LinearGradient
                    colors={['#00b894', '#00a085']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>Send Request</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setRequestModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minWidth: 90,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  requestButton: {
    backgroundColor: '#ff6b6b',
  },
  profileButton: {
    backgroundColor: '#74b9ff',
  },
  buttonContent: {
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  profileDropdown: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
    minWidth: 150,
  },
  profileOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  categoriesSection: {
    marginTop: 20,
  },
  productsSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryPill: {
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryPillSelected: {
    elevation: 4,
  },
  categoryGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  categoryTextSelected: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  productItem: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 15,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  productInfo: {
    marginBottom: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 18,
    color: '#00b894',
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 5,
  },
  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9ecef',
  },
  quantityButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  quantityButtonGradient: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  quantityButtonTextDisabled: {
    color: '#adb5bd',
  },
  quantityDisplay: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  cartBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  modalHeader: {
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  modalBody: {
    padding: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 25,
  },
  modalActions: {
    gap: 15,
  },
  modalButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCancelButton: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});