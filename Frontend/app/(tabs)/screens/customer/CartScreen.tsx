
// import React, { useState, useContext, useEffect } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, TouchableOpacity,
//   TextInput, Alert, ActivityIndicator, Dimensions
// } from 'react-native';
// import axios from 'axios';
// import CONFIG from '../../../config';
// import { AuthContext } from '../../AuthContext';
// import { CartContext } from './CartContext';

// const { width } = Dimensions.get('window');

// export default function CartScreen({ route, navigation }) {
//   const { cart = [] } = route.params || {};
//   // const { cartItems, addToCart, removeFromCart, updateQuantity } = useContext(CartContext);
//   const [address, setAddress] = useState('');
//   const [pendingOrderId, setPendingOrderId] = useState(null);
//   const [pendingOrderItems, setPendingOrderItems] = useState([]);
//   const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [updatingItems, setUpdatingItems] = useState(new Set());
//   const [itemAddOrder, setItemAddOrder] = useState([]);
//   const { token } = useContext(AuthContext);

//   // Group products by ID for local cart
//   const groupedCart = cart.reduce((acc, item) => {
//     const itemId = item.id.toString();
//     if (acc[itemId]) {
//       acc[itemId].quantity += 1;
//     } else {
//       acc[itemId] = { 
//         ...item, 
//         quantity: 1,
//         id: item.id,
//         unit_price: parseFloat(item.price)
//       };
//     }
//     return acc;
//   }, {});

//   const cartItems = Object.values(groupedCart);

//   // Calculate local cart total
//   const localTotal = cartItems.reduce((sum, item) => {
//     const unitPrice = item.unit_price || parseFloat(item.price);
//     const quantity = parseInt(item.quantity) || 1;
//     return sum + (unitPrice * quantity);
//   }, 0);

//   useEffect(() => {
//     checkPendingOrder();
//   }, []);

//   useEffect(() => {
//     if (cartItems.length > 0) {
//       setItemAddOrder(prevOrder => {
//         const existingIds = new Set(prevOrder);
//         const newItems = cartItems
//           .filter(item => !existingIds.has(item.id.toString()))
//           .map(item => item.id.toString());
//         return [...prevOrder, ...newItems];
//       });
//     }
//   }, [cartItems]);

//   useEffect(() => {
//     if (pendingOrderId && cartItems.length > 0) {
//       autoAddToExistingOrder();
//     }
//   }, [cart, pendingOrderId]);

//   const checkPendingOrder = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${CONFIG.API_URL}/orders`, {
//         headers: { Authorization: token },
//       });
      
//       const pending = response.data.orders?.find(order => order.status === 'pending');
//       if (pending) {
//         setPendingOrderId(pending.id);
//         setPendingOrderTotal(parseFloat(pending.total_amount) || 0);

//         try {
//           const itemsResponse = await axios.get(`${CONFIG.API_URL}/orders/${pending.id}/items`, {
//             headers: { Authorization: token }
//           });
          
//           const items = itemsResponse.data.items || [];
//           console.log('Fetched pending order items:', items);
//           setPendingOrderItems(items);
          
//           setItemAddOrder(prevOrder => {
//             const existingIds = new Set(prevOrder);
//             const newServerItems = items
//               .filter(item => !existingIds.has(item.product_id.toString()))
//               .map(item => item.product_id.toString());
//             return [...prevOrder, ...newServerItems];
//           });
          
//           const calculatedTotal = items.reduce((sum, item) => {
//             return sum + (parseFloat(item.total_price_for_item) || parseFloat(item.price) || 0);
//           }, 0);
          
//           console.log('Server total:', itemsResponse.data.total_amount);
//           console.log('Calculated total:', calculatedTotal);
//           console.log('Pending order total from orders list:', pending.total_amount);
          
//           setPendingOrderTotal(parseFloat(itemsResponse.data.total_amount) || parseFloat(pending.total_amount) || 0);
          
//         } catch (itemsError) {
//           console.error('Error fetching pending order items:', itemsError);
//           setPendingOrderItems([]);
//         }
//       } else {
//         console.log('No pending order found');
//         setPendingOrderId(null);
//         setPendingOrderItems([]);
//         setPendingOrderTotal(0);
//         setItemAddOrder([]);
//       }
//     } catch (error) {
//       console.error('Order fetch error:', error?.response?.data || error.message);
//       setPendingOrderId(null);
//       setPendingOrderItems([]);
//       setPendingOrderTotal(0);
//       setItemAddOrder([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const autoAddToExistingOrder = async () => {
//     if (cartItems.length === 0) return;

//     const itemsToSend = cartItems.map(item => ({
//       product_id: parseInt(item.id),
//       quantity: parseInt(item.quantity),
//       price: parseFloat(item.unit_price || item.price)
//     }));

//     const invalidItems = itemsToSend.filter(item => 
//       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
//     );

//     if (invalidItems.length > 0) {
//       console.error('Invalid items detected:', invalidItems);
//       return;
//     }

//     const payload = {
//       delivery_address: address.trim() || 'Default Address',
//       items: itemsToSend
//     };

//     console.log('Auto-adding to existing order:', JSON.stringify(payload, null, 2));

//     try {
//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Auto-add response:', response.data);
//       await checkPendingOrder();

//     } catch (error) {
//       console.error('Auto-add error:', error?.response?.data || error.message);
//     }
//   };

//   const updateItemQuantity = async (productId, newQuantity) => {
//     console.log(`🔧 updateItemQuantity called: Product ${productId}, New quantity: ${newQuantity}`);
    
//     if (!pendingOrderId) {
//       console.log(`❌ No pending order ID found`);
//       Alert.alert('Error', 'No pending order found');
//       return;
//     }

//     const productIdStr = productId.toString();
//     console.log(`🔄 Adding ${productIdStr} to updating items`);
//     setUpdatingItems(prev => new Set(prev).add(productIdStr));

//     try {
//       const payload = {
//         delivery_address: address.trim() || 'Default Address',
//         items: [{
//           product_id: parseInt(productId),
//           quantity: newQuantity,
//           price: 0
//         }]
//       };

//       console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));

//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('📥 Update quantity response:', JSON.stringify(response.data, null, 2));

//       if (newQuantity <= 0) {
//         console.log(`🗑️ Item ${productId} removed, updating local state`);
//         setPendingOrderItems(prevItems => {
//           const filteredItems = prevItems.filter(item => item.product_id.toString() !== productIdStr);
//           console.log(`📊 Items after removal: ${filteredItems.length}`);
//           return filteredItems;
//         });
//         setItemAddOrder(prevOrder => {
//           const filteredOrder = prevOrder.filter(id => id !== productIdStr);
//           console.log(`📋 Order tracking after removal:`, filteredOrder);
//           return filteredOrder;
//         });
//         if (response.data.total_amount !== undefined) {
//           const newTotal = parseFloat(response.data.total_amount) || 0;
//           console.log(`💰 Updating total to: ${newTotal}`);
//           setPendingOrderTotal(newTotal);
//         }
//         if (response.data.items && response.data.items.length === 0) {
//           console.log(`🧹 No items left, clearing order`);
//           setPendingOrderId(null);
//           setPendingOrderItems([]);
//           setPendingOrderTotal(0);
//           setItemAddOrder([]);
//         }
//       } else {
//         console.log(`🔄 Refreshing order data after quantity update`);
//         await checkPendingOrder();
//       }

//     } catch (error) {
//       console.error('❌ Update quantity error:', error?.response?.data || error.message);
//       const errorMessage = error?.response?.data?.message || 
//                           error?.response?.data?.error || 
//                           'Unable to update quantity. Please try again.';
//       Alert.alert('Update Failed', errorMessage);
//     } finally {
//       console.log(`✅ Removing ${productIdStr} from updating items`);
//       setUpdatingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(productIdStr);
//         console.log(`🔄 Updating items remaining:`, Array.from(newSet));
//         return newSet;
//       });
//     }
//   };

//   const decreaseQuantity = async (productId, currentQuantity) => {
//     console.log(`🔽 Decrease quantity called: Product ${productId}, Current quantity: ${currentQuantity}`);
    
//     const newQuantity = currentQuantity - 1;
//     console.log(`New quantity will be: ${newQuantity}`);
    
//     // Direct removal without confirmation dialog
//     if (newQuantity <= 0) {
//       console.log(`🗑️ Item will be removed directly (no confirmation)`);
//       await updateItemQuantity(productId, 0);
//     } else {
//       console.log(`📝 Updating quantity to ${newQuantity}`);
//       await updateItemQuantity(productId, newQuantity);
//     }
//   };

//   const increaseQuantity = async (productId, currentQuantity) => {
//     const newQuantity = currentQuantity + 1;
//     await updateItemQuantity(productId, newQuantity);
//   };

//   const handleCheckout = async () => {
//     if (!address.trim()) {
//       return Alert.alert('Missing Address', 'Please enter a delivery address');
//     }

//     if (pendingOrderId) {
//       navigation.navigate('Payment', { 
//         order_id: pendingOrderId,
//         total_amount: pendingOrderTotal
//       });
//       return;
//     }

//     if (cartItems.length === 0) {
//       return Alert.alert('Cart Empty', 'Please add items to cart before checkout.');
//     }

//     const itemsToSend = cartItems.map(item => ({
//       product_id: parseInt(item.id),
//       quantity: parseInt(item.quantity),
//       price: parseFloat(item.unit_price || item.price)
//     }));

//     const invalidItems = itemsToSend.filter(item => 
//       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
//     );

//     if (invalidItems.length > 0) {
//       console.error('Invalid items detected:', invalidItems);
//       return Alert.alert('Invalid Items', 'Some items in your cart are invalid. Please refresh and try again.');
//     }

//     const payload = {
//       delivery_address: address.trim(),
//       items: itemsToSend
//     };

//     console.log('Sending checkout payload:', JSON.stringify(payload, null, 2));
//     console.log('Expected local total:', localTotal.toFixed(2));

//     try {
//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       console.log('Checkout response:', response.data);

//       const orderId = response.data.order_id;
//       const serverTotal = parseFloat(response.data.total_amount);
      
//       console.log('Server returned total:', serverTotal);
//       console.log('Local calculated total:', localTotal);
      
//       if (!orderId) {
//         throw new Error('No order ID received from server');
//       }

//       await checkPendingOrder();

//       navigation.navigate('Payment', { 
//         order_id: orderId,
//         total_amount: serverTotal
//       });

//     } catch (error) {
//       console.error('Checkout error:', error?.response?.data || error.message);
//       const errorMessage = error?.response?.data?.message || 
//                           error?.response?.data?.error || 
//                           'Unable to process checkout. Please try again.';
//       Alert.alert('Checkout Failed', errorMessage);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#00b894" />
//           <Text style={styles.loadingText}>Loading your cart...</Text>
//         </View>
//       </View>
//     );
//   }

//   const hasLocalItems = cartItems.length > 0;
//   const hasPendingItems = pendingOrderItems.length > 0;
  
//   let displayItems;
//   if (hasPendingItems) {
//     displayItems = [...pendingOrderItems].sort((a, b) => {
//       const aIndex = itemAddOrder.indexOf(a.product_id.toString());
//       const bIndex = itemAddOrder.indexOf(b.product_id.toString());
      
//       if (aIndex !== -1 && bIndex !== -1) {
//         return aIndex - bIndex;
//       }
      
//       if (aIndex !== -1) return -1;
//       if (bIndex !== -1) return 1;
      
//       return 0;
//     });
//   } else {
//     displayItems = cartItems;
//   }
  
//   const displayTotal = hasPendingItems ? pendingOrderTotal : localTotal;

//   if (!hasLocalItems && !hasPendingItems) {
//     return (
//       <View style={styles.centered}>
//         <View style={styles.emptyCartContainer}>
//           <Text style={styles.emptyCartIcon}>🛒</Text>
//           <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
//           <Text style={styles.emptyCartSubtitle}>Add some delicious items to get started</Text>
//           <TouchableOpacity
//             style={styles.continueShoppingButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.continueShoppingText}>Continue Shopping</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {hasPendingItems ? 'Order Review' : 'Shopping Cart'}
//         </Text>
//         <View style={styles.headerRight}>
//           <Text style={styles.itemCount}>{displayItems.length} items</Text>
//         </View>
//       </View>
      
//       <FlatList
//         data={displayItems}
//         keyExtractor={(item) => {
//           return item.product_id ? item.product_id.toString() : item.id.toString();
//         }}
//         renderItem={({ item, index }) => {
//           const isCartItem = !item.product_id;
//           const itemName = isCartItem ? item.name : item.product_name;
//           const itemId = isCartItem ? item.id : item.product_id;
//           const quantity = parseInt(item.quantity) || 1;
//           const itemIdStr = itemId.toString();
//           const isUpdating = updatingItems.has(itemIdStr);
          
//           let unitPrice, totalPrice;
//           if (isCartItem) {
//             unitPrice = parseFloat(item.unit_price || item.price);
//             totalPrice = unitPrice * quantity;
//           } else {
//             totalPrice = parseFloat(item.price);
//             unitPrice = parseFloat(item.unit_price) || (quantity > 0 ? totalPrice / quantity : 0);
//           }

//           return (
//             <View style={[
//               styles.cartItem, 
//               index === displayItems.length - 1 && styles.lastCartItem
//             ]}>
//               {/* Product Info */}
//               <View style={styles.itemContent}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemName} numberOfLines={2}>
//                     {itemName || `Product ${itemId}`}
//                   </Text>
//                   {!isCartItem && (
//                     <TouchableOpacity
//                       style={styles.removeButton}
//                       onPress={() => decreaseQuantity(itemId, 1)}
//                       disabled={isUpdating}
//                     >
//                       <Text style={styles.removeButtonText}>✕</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
                
//                 <View style={styles.priceContainer}>
//                   <Text style={styles.unitPrice}>₹{unitPrice.toFixed(2)} each</Text>
//                 </View>
                
//                 <View style={styles.bottomRow}>
//                   <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
                  
//                   {!isCartItem && (
//                     <View style={styles.quantityControls}>
//                       <TouchableOpacity
//                         style={[
//                           styles.quantityButton, 
//                           styles.decreaseButton,
//                           (isUpdating || quantity <= 1) && styles.disabledButton
//                         ]}
//                         onPress={() => decreaseQuantity(itemId, quantity)}
//                         disabled={isUpdating}
//                       >
//                         <Text style={styles.quantityButtonText}>−</Text>
//                       </TouchableOpacity>
                      
//                       <View style={styles.quantityDisplay}>
//                         {isUpdating ? (
//                           <ActivityIndicator size="small" color="#00b894" />
//                         ) : (
//                           <Text style={styles.quantityText}>{quantity}</Text>
//                         )}
//                       </View>
                      
//                       <TouchableOpacity
//                         style={[
//                           styles.quantityButton, 
//                           styles.increaseButton,
//                           isUpdating && styles.disabledButton
//                         ]}
//                         onPress={() => increaseQuantity(itemId, quantity)}
//                         disabled={isUpdating}
//                       >
//                         <Text style={styles.quantityButtonText}>+</Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         style={styles.itemsList}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//       />

//       {/* Bottom Section */}
//       <View style={styles.bottomSection}>
//         {/* Address Input */}
//         <View style={styles.addressContainer}>
//           <Text style={styles.addressLabel}>Delivery Address</Text>
//           <TextInput
//             style={styles.addressInput}
//             placeholder="Enter your delivery address"
//             value={address}
//             onChangeText={setAddress}
//             multiline={true}
//             numberOfLines={2}
//             placeholderTextColor="#999"
//           />
//         </View>

//         {/* Order Summary */}
//         <View style={styles.summaryContainer}>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Subtotal ({displayItems.length} items)</Text>
//             <Text style={styles.summaryValue}>₹{displayTotal.toFixed(2)}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Delivery Fee</Text>
//             <Text style={styles.summaryValue}>FREE</Text>
//           </View>
//           <View style={[styles.summaryRow, styles.totalRow]}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <Text style={styles.totalValue}>₹{displayTotal.toFixed(2)}</Text>
//           </View>
//         </View>

//         {/* Checkout Button */}
//         <TouchableOpacity 
//           style={[
//             styles.checkoutButton,
//             loading && styles.disabledCheckoutButton
//           ]} 
//           onPress={handleCheckout}
//           disabled={loading}
//         >
//           <Text style={styles.checkoutButtonText}>
//             {pendingOrderId ? 'Proceed to Payment' : 'Place Order'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     padding: 40,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: '#666',
//     fontWeight: '500',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f8f9fa',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backButtonText: {
//     fontSize: 20,
//     color: '#333',
//     fontWeight: '600',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerRight: {
//     width: 40,
//     alignItems: 'flex-end',
//   },
//   itemCount: {
//     fontSize: 12,
//     color: '#00b894',
//     fontWeight: '600',
//     backgroundColor: '#e8f5f3',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   listContainer: {
//     padding: 16,
//     paddingBottom: 0,
//   },
//   cartItem: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginBottom: 12,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   lastCartItem: {
//     marginBottom: 8,
//   },
//   itemContent: {
//     flex: 1,
//   },
//   itemHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     flex: 1,
//     marginRight: 12,
//     lineHeight: 22,
//   },
//   removeButton: {
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#fee',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   removeButtonText: {
//     fontSize: 12,
//     color: '#e74c3c',
//     fontWeight: 'bold',
//   },
//   priceContainer: {
//     marginBottom: 12,
//   },
//   unitPrice: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '500',
//   },
//   bottomRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   totalPrice: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#00b894',
//   },
//   quantityControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f8f9fa',
//     borderRadius: 24,
//     padding: 4,
//   },
//   quantityButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   decreaseButton: {
//     backgroundColor: '#e8f5f3',
//   },
//   increaseButton: {
//     backgroundColor: '#00b894',
//   },
//   disabledButton: {
//     backgroundColor: '#ddd',
//     opacity: 0.6,
//   },
//   quantityButtonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   quantityDisplay: {
//     minWidth: 40,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: 8,
//   },
//   quantityText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   bottomSection: {
//     backgroundColor: '#fff',
//     paddingTop: 20,
//     paddingHorizontal: 20,
//     paddingBottom: 34,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//   },
//   addressContainer: {
//     marginBottom: 20,
//   },
//   addressLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 8,
//   },
//   addressInput: {
//     borderWidth: 1.5,
//     borderColor: '#e0e0e0',
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 15,
//     backgroundColor: '#fafafa',
//     minHeight: 56,
//     textAlignVertical: 'top',
//     color: '#333',
//   },
//   summaryContainer: {
//     marginBottom: 20,
//     paddingVertical: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   summaryLabel: {
//     fontSize: 15,
//     color: '#666',
//     fontWeight: '500',
//   },
//   summaryValue: {
//     fontSize: 15,
//     color: '#333',
//     fontWeight: '600',
//   },
//   totalRow: {
//     marginTop: 8,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//     marginBottom: 0,
//   },
//   totalLabel: {
//     fontSize: 18,
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   totalValue: {
//     fontSize: 20,
//     color: '#00b894',
//     fontWeight: 'bold',
//   },
//   checkoutButton: {
//     backgroundColor: '#00b894',
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#00b894',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
//   disabledCheckoutButton: {
//     backgroundColor: '#ccc',
//     elevation: 0,
//     shadowOpacity: 0,
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//   },
//   emptyCartContainer: {
//     alignItems: 'center',
//     padding: 40,
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     marginHorizontal: 20,
//   },
//   emptyCartIcon: {
//     fontSize: 64,
//     marginBottom: 16,
//   },
//   emptyCartTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   emptyCartSubtitle: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   continueShoppingButton: {
//     backgroundColor: '#00b894',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 24,
//     elevation: 2,
//     shadowColor: '#00b894',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   continueShoppingText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// // import React, { useState, useContext, useEffect } from 'react';
// // import {
// //   View, Text, FlatList, StyleSheet, TouchableOpacity,
// //   TextInput, Alert, ActivityIndicator, Dimensions
// // } from 'react-native';
// // import axios from 'axios';
// // import CONFIG from '../../../config';
// // import { AuthContext } from '../../AuthContext';

// // const { width } = Dimensions.get('window');

// // export default function CartScreen({ route, navigation }) {
// //   const cart = (route.params && route.params.cart) || [];
// //   const [address, setAddress] = useState('');
// //   const [pendingOrderId, setPendingOrderId] = useState(null);
// //   const [pendingOrderItems, setPendingOrderItems] = useState([]);
// //   const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
// //   const [loading, setLoading] = useState(true);
// //   const [updatingItems, setUpdatingItems] = useState(new Set());
// //   const [itemAddOrder, setItemAddOrder] = useState([]);
// //   const { token } = useContext(AuthContext);

// //   // Group products by ID for local cart
// //   const groupedCart = (cart || []).reduce((acc, item) => {
// //     const itemId = item.id.toString();
// //     if (acc[itemId]) {
// //       acc[itemId].quantity += 1;
// //     } else {
// //       acc[itemId] = { 
// //         ...item, 
// //         quantity: 1,
// //         id: item.id,
// //         unit_price: parseFloat(item.price)
// //       };
// //     }
// //     return acc;
// //   }, {});

// //   const cartItems = Object.values(groupedCart);

// //   // Calculate local cart total
// //   const localTotal = (cartItems || []).reduce((sum, item) => {
// //     const unitPrice = item.unit_price || parseFloat(item.price);
// //     const quantity = parseInt(item.quantity) || 1;
// //     return sum + (unitPrice * quantity);
// //   }, 0);

// //   useEffect(() => {
// //     checkPendingOrder();
// //   }, []);

// //   useEffect(() => {
// //     if (cartItems.length > 0) {
// //       setItemAddOrder(prevOrder => {
// //         const existingIds = new Set(prevOrder);
// //         const newItems = cartItems
// //           .filter(item => !existingIds.has(item.id.toString()))
// //           .map(item => item.id.toString());
// //         return [...prevOrder, ...newItems];
// //       });
// //     }
// //   }, [cartItems]);

// //   useEffect(() => {
// //     if (pendingOrderId && cartItems.length > 0) {
// //       autoAddToExistingOrder();
// //     }
// //   }, [cart, pendingOrderId]);

// //   const checkPendingOrder = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get(`${CONFIG.API_URL}/orders`, {
// //         headers: { Authorization: token },
// //       });
      
// //       const pending = response.data.orders?.find(order => order.status === 'pending');
// //       if (pending) {
// //         setPendingOrderId(pending.id);
// //         setPendingOrderTotal(parseFloat(pending.total_amount) || 0);

// //         try {
// //           const itemsResponse = await axios.get(`${CONFIG.API_URL}/orders/${pending.id}/items`, {
// //             headers: { Authorization: token }
// //           });
          
// //           const items = itemsResponse.data.items || [];
// //           setPendingOrderItems(items); 
          
// //           setItemAddOrder(prevOrder => {
// //             const existingIds = new Set(prevOrder);
// //             const newServerItems = items
// //               .filter(item => !existingIds.has(item.product_id.toString()))
// //               .map(item => item.product_id.toString());
// //             return [...prevOrder, ...newServerItems];
// //           });
          
// //           const calculatedTotal = items.reduce((sum, item) => {
// //             return sum + (parseFloat(item.total_price_for_item) || parseFloat(item.price) || 0);
// //           }, 0);
          
// //           setPendingOrderTotal(parseFloat(itemsResponse.data.total_amount) || parseFloat(pending.total_amount) || 0);
          
// //         } catch (itemsError) {
// //           console.error('Error fetching pending order items:', itemsError);
// //           setPendingOrderItems([]);
// //         }
// //       } else {
// //         setPendingOrderId(null);
// //         setPendingOrderItems([]);
// //         setPendingOrderTotal(0);
// //         setItemAddOrder([]);
// //       }
// //     } catch (error) {
// //       console.error('Order fetch error:', error?.response?.data || error.message);
// //       setPendingOrderId(null);
// //       setPendingOrderItems([]);
// //       setPendingOrderTotal(0);
// //       setItemAddOrder([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const autoAddToExistingOrder = async () => {
// //     if (!cartItems || cartItems.length === 0) return;

// //     const itemsToSend = cartItems.map(item => ({
// //       product_id: parseInt(item.id),
// //       quantity: parseInt(item.quantity),
// //       price: parseFloat(item.unit_price || item.price)
// //     }));

// //     const invalidItems = itemsToSend.filter(item => 
// //       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
// //     );

// //     if (invalidItems.length > 0) {
// //       console.error('Invalid items detected:', invalidItems);
// //       return;
// //     }

// //     const payload = {
// //       delivery_address: address.trim() || 'Default Address',
// //       items: itemsToSend
// //     };

// //     try {
// //       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
// //         headers: { 
// //           Authorization: token,
// //           'Content-Type': 'application/json'
// //         }
// //       });
// //       await checkPendingOrder();
// //     } catch (error) {
// //       console.error('Auto-add error:', error?.response?.data || error.message);
// //     }
// //   };

// //   const updateItemQuantity = async (productId, newQuantity) => {
// //     if (!pendingOrderId) {
// //       Alert.alert('Error', 'No pending order found');
// //       return;
// //     }

// //     const productIdStr = productId.toString();
// //     setUpdatingItems(prev => new Set(prev).add(productIdStr));

// //     try {
// //       const payload = {
// //         delivery_address: address.trim() || 'Default Address',
// //         items: [{
// //           product_id: parseInt(productId),
// //           quantity: newQuantity,
// //           price: 0
// //         }]
// //       };

// //       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
// //         headers: { 
// //           Authorization: token,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (newQuantity <= 0) {
// //         setPendingOrderItems(prevItems => prevItems.filter(item => item.product_id.toString() !== productIdStr));
// //         setItemAddOrder(prevOrder => prevOrder.filter(id => id !== productIdStr));
// //         setPendingOrderTotal(parseFloat(response.data.total_amount) || 0);

// //         if (response.data.items && response.data.items.length === 0) {
// //           setPendingOrderId(null);
// //           setPendingOrderItems([]);
// //           setPendingOrderTotal(0);
// //           setItemAddOrder([]);
// //         }
// //       } else {
// //         await checkPendingOrder();
// //       }

// //     } catch (error) {
// //       const errorMessage = error?.response?.data?.message || 
// //                           error?.response?.data?.error || 
// //                           'Unable to update quantity. Please try again.';
// //       Alert.alert('Update Failed', errorMessage);
// //     } finally {
// //       setUpdatingItems(prev => {
// //         const newSet = new Set(prev);
// //         newSet.delete(productIdStr);
// //         return newSet;
// //       });
// //     }
// //   };

// //   const decreaseQuantity = async (productId, currentQuantity) => {
// //     const newQuantity = currentQuantity - 1;
// //     if (newQuantity <= 0) {
// //       await updateItemQuantity(productId, 0);
// //     } else {
// //       await updateItemQuantity(productId, newQuantity);
// //     }
// //   };

// //   const increaseQuantity = async (productId, currentQuantity) => {
// //     await updateItemQuantity(productId, currentQuantity + 1);
// //   };

// //   const handleCheckout = async () => {
// //     if (!address.trim()) {
// //       return Alert.alert('Missing Address', 'Please enter a delivery address');
// //     }

// //     if (pendingOrderId) {
// //       navigation.navigate('Payment', { 
// //         order_id: pendingOrderId,
// //         total_amount: pendingOrderTotal
// //       });
// //       return;
// //     }

// //     if (!cartItems || cartItems.length === 0) {
// //       return Alert.alert('Cart Empty', 'Please add items to cart before checkout.');
// //     }

// //     const itemsToSend = cartItems.map(item => ({
// //       product_id: parseInt(item.id),
// //       quantity: parseInt(item.quantity),
// //       price: parseFloat(item.unit_price || item.price)
// //     }));

// //     const invalidItems = itemsToSend.filter(item => 
// //       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
// //     );

// //     if (invalidItems.length > 0) {
// //       return Alert.alert('Invalid Items', 'Some items in your cart are invalid. Please refresh and try again.');
// //     }

// //     const payload = {
// //       delivery_address: address.trim(),
// //       items: itemsToSend
// //     };

// //     try {
// //       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
// //         headers: { 
// //           Authorization: token,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       const orderId = response.data.order_id;
// //       const serverTotal = parseFloat(response.data.total_amount);

// //       if (!orderId) throw new Error('No order ID received from server');

// //       await checkPendingOrder();

// //       navigation.navigate('Payment', { 
// //         order_id: orderId,
// //         total_amount: serverTotal
// //       });

// //     } catch (error) {
// //       const errorMessage = error?.response?.data?.message || 
// //                           error?.response?.data?.error || 
// //                           'Unable to process checkout. Please try again.';
// //       Alert.alert('Checkout Failed', errorMessage);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <View style={styles.centered}>
// //         <View style={styles.loadingContainer}>
// //           <ActivityIndicator size="large" color="#00b894" />
// //           <Text style={styles.loadingText}>Loading your cart...</Text>
// //         </View>
// //       </View>
// //     );
// //   }

// //   const hasLocalItems = cartItems && cartItems.length > 0;
// //   const hasPendingItems = pendingOrderItems && pendingOrderItems.length > 0;
  
// //   let displayItems;
// //   if (hasPendingItems) {
// //     displayItems = [...pendingOrderItems].sort((a, b) => {
// //       const aIndex = itemAddOrder.indexOf(a.product_id.toString());
// //       const bIndex = itemAddOrder.indexOf(b.product_id.toString());
// //       if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
// //       if (aIndex !== -1) return -1;
// //       if (bIndex !== -1) return 1;
// //       return 0;
// //     });
// //   } else {
// //     displayItems = cartItems || [];
// //   }
  
// //   const displayTotal = hasPendingItems ? pendingOrderTotal : localTotal;

// //   if (!hasLocalItems && !hasPendingItems) {
// //     return (
// //       <View style={styles.centered}>
// //         <View style={styles.emptyCartContainer}>
// //           <Text style={styles.emptyCartIcon}>🛒</Text>
// //           <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
// //           <Text style={styles.emptyCartSubtitle}>Add some delicious items to get started</Text>
// //           <TouchableOpacity
// //             style={styles.continueShoppingButton}
// //             onPress={() => navigation.goBack()}
// //           >
// //             <Text style={styles.continueShoppingText}>Continue Shopping</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       {/* Header */}
// //       <View style={styles.header}>
// //         <TouchableOpacity 
// //           style={styles.backButton} 
// //           onPress={() => navigation.goBack()}
// //         >
// //           <Text style={styles.backButtonText}>←</Text>
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>
// //           {hasPendingItems ? 'Order Review' : 'Shopping Cart'}
// //         </Text>
// //         <View style={styles.headerRight}>
// //           <Text style={styles.itemCount}>{displayItems.length} items</Text>
// //         </View>
// //       </View>
      
// //       <FlatList
// //         data={displayItems}
// //         keyExtractor={(item) => item.product_id ? item.product_id.toString() : item.id.toString()}
// //         renderItem={({ item, index }) => {
// //           const isCartItem = !item.product_id;
// //           const itemName = isCartItem ? item.name : item.product_name;
// //           const itemId = isCartItem ? item.id : item.product_id;
// //           const quantity = parseInt(item.quantity) || 1;
// //           const itemIdStr = itemId.toString();
// //           const isUpdating = updatingItems.has(itemIdStr);

// //           let unitPrice, totalPrice;
// //           if (isCartItem) {
// //             unitPrice = parseFloat(item.unit_price || item.price);
// //             totalPrice = unitPrice * quantity;
// //           } else {
// //             totalPrice = parseFloat(item.price);
// //             unitPrice = parseFloat(item.unit_price) || (quantity > 0 ? totalPrice / quantity : 0);
// //           }

// //           return (
// //             <View style={[styles.cartItem, index === displayItems.length - 1 && styles.lastCartItem]}>
// //               <View style={styles.itemContent}>
// //                 <View style={styles.itemHeader}>
// //                   <Text style={styles.itemName} numberOfLines={2}>{itemName || `Product ${itemId}`}</Text>
// //                   {!isCartItem && (
// //                     <TouchableOpacity
// //                       style={styles.removeButton}
// //                       onPress={() => decreaseQuantity(itemId, 1)}
// //                       disabled={isUpdating}
// //                     >
// //                       <Text style={styles.removeButtonText}>✕</Text>
// //                     </TouchableOpacity>
// //                   )}
// //                 </View>
// //                 <View style={styles.priceContainer}>
// //                   <Text style={styles.unitPrice}>₹{unitPrice.toFixed(2)} each</Text>
// //                 </View>
// //                 <View style={styles.bottomRow}>
// //                   <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
// //                   {!isCartItem && (
// //                     <View style={styles.quantityControls}>
// //                       <TouchableOpacity
// //                         style={[styles.quantityButton, styles.decreaseButton, (isUpdating || quantity <= 1) && styles.disabledButton]}
// //                         onPress={() => decreaseQuantity(itemId, quantity)}
// //                         disabled={isUpdating}
// //                       >
// //                         <Text style={styles.quantityButtonText}>−</Text>
// //                       </TouchableOpacity>
// //                       <View style={styles.quantityDisplay}>
// //                         {isUpdating ? <ActivityIndicator size="small" color="#00b894" /> : <Text style={styles.quantityText}>{quantity}</Text>}
// //                       </View>
// //                       <TouchableOpacity
// //                         style={[styles.quantityButton, styles.increaseButton, isUpdating && styles.disabledButton]}
// //                         onPress={() => increaseQuantity(itemId, quantity)}
// //                         disabled={isUpdating}
// //                       >
// //                         <Text style={styles.quantityButtonText}>+</Text>
// //                       </TouchableOpacity>
// //                     </View>
// //                   )}
// //                 </View>
// //               </View>
// //             </View>
// //           );
// //         }}
// //         style={styles.itemsList}
// //         showsVerticalScrollIndicator={false}
// //         contentContainerStyle={styles.listContainer}
// //       />

// //       {/* Bottom Section */}
// //       <View style={styles.bottomSection}>
// //         <View style={styles.addressContainer}>
// //           <Text style={styles.addressLabel}>Delivery Address</Text>
// //           <TextInput
// //             style={styles.addressInput}
// //             placeholder="Enter your delivery address"
// //             value={address}
// //             onChangeText={setAddress}
// //             multiline={true}
// //             numberOfLines={2}
// //             placeholderTextColor="#999"
// //           />
// //         </View>

// //         <View style={styles.summaryContainer}>
// //           <View style={styles.summaryRow}>
// //             <Text style={styles.summaryLabel}>Subtotal ({displayItems.length} items)</Text>
// //             <Text style={styles.summaryValue}>₹{displayTotal.toFixed(2)}</Text>
// //           </View>
// //           <View style={styles.summaryRow}>
// //             <Text style={styles.summaryLabel}>Delivery Fee</Text>
// //             <Text style={styles.summaryValue}>FREE</Text>
// //           </View>
// //           <View style={[styles.summaryRow, styles.totalRow]}>
// //             <Text style={styles.totalLabel}>Total</Text>
// //             <Text style={styles.totalValue}>₹{displayTotal.toFixed(2)}</Text>
// //           </View>
// //         </View>

// //         <TouchableOpacity 
// //           style={[styles.checkoutButton, loading && styles.disabledCheckoutButton]} 
// //           onPress={handleCheckout}
// //           disabled={loading}
// //         >
// //           <Text style={styles.checkoutButtonText}>
// //             {pendingOrderId ? 'Proceed to Payment' : 'Place Order'}
// //           </Text>
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //     container: {
// //       flex: 1,
// //       backgroundColor: '#f8f9fa',
// //     },
// //     centered: {
// //       flex: 1,
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       padding: 20,
// //     },
// //     loadingContainer: {
// //       alignItems: 'center',
// //       padding: 40,
// //       backgroundColor: '#fff',
// //       borderRadius: 20,
// //       elevation: 3,
// //       shadowColor: '#000',
// //       shadowOffset: { width: 0, height: 2 },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 4,
// //     },
// //     loadingText: {
// //       marginTop: 16,
// //       fontSize: 16,
// //       color: '#666',
// //       fontWeight: '500',
// //     },
// //     header: {
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       justifyContent: 'space-between',
// //       paddingHorizontal: 20,
// //       paddingVertical: 16,
// //       backgroundColor: '#fff',
// //       borderBottomWidth: 1,
// //       borderBottomColor: '#f0f0f0',
// //       elevation: 2,
// //       shadowColor: '#000',
// //       shadowOffset: { width: 0, height: 1 },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 2,
// //     },
// //     backButton: {
// //       width: 40,
// //       height: 40,
// //       borderRadius: 20,
// //       backgroundColor: '#f8f9fa',
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //     },
// //     backButtonText: {
// //       fontSize: 20,
// //       color: '#333',
// //       fontWeight: '600',
// //     },
// //     headerTitle: {
// //       fontSize: 18,
// //       fontWeight: 'bold',
// //       color: '#333',
// //       flex: 1,
// //       textAlign: 'center',
// //     },
// //     headerRight: {
// //       width: 40,
// //       alignItems: 'flex-end',
// //     },
// //     itemCount: {
// //       fontSize: 12,
// //       color: '#00b894',
// //       fontWeight: '600',
// //       backgroundColor: '#e8f5f3',
// //       paddingHorizontal: 8,
// //       paddingVertical: 4,
// //       borderRadius: 12,
// //     },
// //     listContainer: {
// //       padding: 16,
// //       paddingBottom: 0,
// //     },
// //     cartItem: {
// //       backgroundColor: '#fff',
// //       borderRadius: 16,
// //       marginBottom: 12,
// //       padding: 16,
// //       elevation: 2,
// //       shadowColor: '#000',
// //       shadowOffset: { width: 0, height: 1 },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 3,
// //     },
// //     lastCartItem: {
// //       marginBottom: 8,
// //     },
// //     itemContent: {
// //       flex: 1,
// //     },
// //     itemHeader: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       alignItems: 'flex-start',
// //       marginBottom: 8,
// //     },
// //     itemName: {
// //       fontSize: 16,
// //       fontWeight: '600',
// //       color: '#333',
// //       flex: 1,
// //       marginRight: 12,
// //       lineHeight: 22,
// //     },
// //     removeButton: {
// //       width: 24,
// //       height: 24,
// //       borderRadius: 12,
// //       backgroundColor: '#fee',
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //     },
// //     removeButtonText: {
// //       fontSize: 12,
// //       color: '#e74c3c',
// //       fontWeight: 'bold',
// //     },
// //     priceContainer: {
// //       marginBottom: 12,
// //     },
// //     unitPrice: {
// //       fontSize: 14,
// //       color: '#666',
// //       fontWeight: '500',
// //     },
// //     bottomRow: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       alignItems: 'center',
// //     },
// //     totalPrice: {
// //       fontSize: 18,
// //       fontWeight: 'bold',
// //       color: '#00b894',
// //     },
// //     quantityControls: {
// //       flexDirection: 'row',
// //       alignItems: 'center',
// //       backgroundColor: '#f8f9fa',
// //       borderRadius: 24,
// //       padding: 4,
// //     },
// //     quantityButton: {
// //       width: 32,
// //       height: 32,
// //       borderRadius: 16,
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //     },
// //     decreaseButton: {
// //       backgroundColor: '#e8f5f3',
// //     },
// //     increaseButton: {
// //       backgroundColor: '#00b894',
// //     },
// //     disabledButton: {
// //       backgroundColor: '#ddd',
// //       opacity: 0.6,
// //     },
// //     quantityButtonText: {
// //       fontSize: 16,
// //       fontWeight: 'bold',
// //     },
// //     quantityDisplay: {
// //       minWidth: 40,
// //       height: 32,
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       marginHorizontal: 8,
// //     },
// //     quantityText: {
// //       fontSize: 16,
// //       fontWeight: 'bold',
// //       color: '#333',
// //     },
// //     bottomSection: {
// //       backgroundColor: '#fff',
// //       paddingTop: 20,
// //       paddingHorizontal: 20,
// //       paddingBottom: 34,
// //       borderTopLeftRadius: 24,
// //       borderTopRightRadius: 24,
// //       elevation: 8,
// //       shadowColor: '#000',
// //       shadowOffset: { width: 0, height: -2 },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 8,
// //     },
// //     addressContainer: {
// //       marginBottom: 20,
// //     },
// //     addressLabel: {
// //       fontSize: 16,
// //       fontWeight: '600',
// //       color: '#333',
// //       marginBottom: 8,
// //     },
// //     addressInput: {
// //       borderWidth: 1.5,
// //       borderColor: '#e0e0e0',
// //       borderRadius: 12,
// //       padding: 16,
// //       fontSize: 15,
// //       backgroundColor: '#fafafa',
// //       minHeight: 56,
// //       textAlignVertical: 'top',
// //       color: '#333',
// //     },
// //     summaryContainer: {
// //       marginBottom: 20,
// //       paddingVertical: 16,
// //       borderTopWidth: 1,
// //       borderTopColor: '#f0f0f0',
// //     },
// //     summaryRow: {
// //       flexDirection: 'row',
// //       justifyContent: 'space-between',
// //       alignItems: 'center',
// //       marginBottom: 8,
// //     },
// //     summaryLabel: {
// //       fontSize: 15,
// //       color: '#666',
// //       fontWeight: '500',
// //     },
// //     summaryValue: {
// //       fontSize: 15,
// //       color: '#333',
// //       fontWeight: '600',
// //     },
// //     totalRow: {
// //       marginTop: 8,
// //       paddingTop: 12,
// //       borderTopWidth: 1,
// //       borderTopColor: '#f0f0f0',
// //       marginBottom: 0,
// //     },
// //     totalLabel: {
// //       fontSize: 18,
// //       color: '#333',
// //       fontWeight: 'bold',
// //     },
// //     totalValue: {
// //       fontSize: 20,
// //       color: '#00b894',
// //       fontWeight: 'bold',
// //     },
// //     checkoutButton: {
// //       backgroundColor: '#00b894',
// //       paddingVertical: 16,
// //       borderRadius: 16,
// //       alignItems: 'center',
// //       elevation: 3,
// //       shadowColor: '#00b894',
// //       shadowOffset: { width: 0, height: 4 },
// //       shadowOpacity: 0.3,
// //       shadowRadius: 8,
// //     },
// //     disabledCheckoutButton: {
// //       backgroundColor: '#ccc',
// //       elevation: 0,
// //       shadowOpacity: 0,
// //     },
// //     checkoutButtonText: {
// //       color: '#fff',
// //       fontSize: 16,
// //       fontWeight: 'bold',
// //       letterSpacing: 0.5,
// //     },
// //     emptyCartContainer: {
// //       alignItems: 'center',
// //       padding: 40,
// //       backgroundColor: '#fff',
// //       borderRadius: 24,
// //       elevation: 3,
// //       shadowColor: '#000',
// //       shadowOffset: { width: 0, height: 2 },
// //       shadowOpacity: 0.1,
// //       shadowRadius: 8,
// //       marginHorizontal: 20,
// //     },
// //     emptyCartIcon: {
// //       fontSize: 64,
// //       marginBottom: 16,
// //     },
// //     emptyCartTitle: {
// //       fontSize: 20,
// //       fontWeight: 'bold',
// //       color: '#333',
// //       marginBottom: 8,
// //     },
// //     emptyCartSubtitle: {
// //       fontSize: 16,
// //       color: '#666',
// //       textAlign: 'center',
// //       marginBottom: 24,
// //       lineHeight: 22,
// //     },
// //     continueShoppingButton: {
// //       backgroundColor: '#00b894',
// //       paddingHorizontal: 24,
// //       paddingVertical: 12,
// //       borderRadius: 24,
// //       elevation: 2,
// //       shadowColor: '#00b894',
// //       shadowOffset: { width: 0, height: 2 },
// //       shadowOpacity: 0.3,
// //       shadowRadius: 4,
// //     },
// //     continueShoppingText: {
// //       color: '#fff',
// //       fontSize: 16,
// //       fontWeight: '600',
// //     },
// //   });


// import React, { useState, useContext, useEffect } from 'react';
// import {
//   View, Text, FlatList, StyleSheet, TouchableOpacity,
//   TextInput, Alert, ActivityIndicator, Dimensions
// } from 'react-native';
// import axios from 'axios';
// import CONFIG from '../../../config';
// import { AuthContext } from '../../AuthContext';
// import { CartContext } from './CartContext';

// const { width } = Dimensions.get('window');

// export default function CartScreen({ navigation }) {
//   // ✅ Get cart AND removeItem from context
//   const { cart, clearCart, removeItem: removeFromContext } = useContext(CartContext);
  
//   const [address, setAddress] = useState('');
//   const [pendingOrderId, setPendingOrderId] = useState(null);
//   const [pendingOrderItems, setPendingOrderItems] = useState([]);
//   const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [updatingItems, setUpdatingItems] = useState(new Set());
//   const [itemAddOrder, setItemAddOrder] = useState([]);
//   const { token } = useContext(AuthContext);

//   // Group products by ID for local cart
//   const groupedCart = cart.reduce((acc, item) => {
//     const itemId = item.id.toString();
//     if (acc[itemId]) {
//       acc[itemId].quantity += 1;
//     } else {
//       acc[itemId] = { 
//         ...item, 
//         quantity: 1,
//         id: item.id,
//         unit_price: parseFloat(item.price)
//       };
//     }
//     return acc;
//   }, {});

//   const cartItems = Object.values(groupedCart);

//   // Calculate local cart total
//   const localTotal = cartItems.reduce((sum, item) => {
//     const unitPrice = item.unit_price || parseFloat(item.price);
//     const quantity = parseInt(item.quantity) || 1;
//     return sum + (unitPrice * quantity);
//   }, 0);

//   useEffect(() => {
//     checkPendingOrder();
//   }, []);

//   useEffect(() => {
//     if (cartItems.length > 0) {
//       setItemAddOrder(prevOrder => {
//         const existingIds = new Set(prevOrder);
//         const newItems = cartItems
//           .filter(item => !existingIds.has(item.id.toString()))
//           .map(item => item.id.toString());
//         return [...prevOrder, ...newItems];
//       });
//     }
//   }, [cartItems]);

//   useEffect(() => {
//     if (pendingOrderId && cartItems.length > 0) {
//       autoAddToExistingOrder();
//     }
//   }, [cart, pendingOrderId]);

//   const checkPendingOrder = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${CONFIG.API_URL}/orders`, {
//         headers: { Authorization: token },
//       });
      
//       const pending = response.data.orders?.find(order => order.status === 'pending');
//       if (pending) {
//         setPendingOrderId(pending.id);
//         setPendingOrderTotal(parseFloat(pending.total_amount) || 0);

//         try {
//           const itemsResponse = await axios.get(`${CONFIG.API_URL}/orders/${pending.id}/items`, {
//             headers: { Authorization: token }
//           });
          
//           const items = itemsResponse.data.items || [];
//           setPendingOrderItems(items);
          
//           setItemAddOrder(prevOrder => {
//             const existingIds = new Set(prevOrder);
//             const newServerItems = items
//               .filter(item => !existingIds.has(item.product_id.toString()))
//               .map(item => item.product_id.toString());
//             return [...prevOrder, ...newServerItems];
//           });
          
//           setPendingOrderTotal(parseFloat(itemsResponse.data.total_amount) || parseFloat(pending.total_amount) || 0);
          
//         } catch (itemsError) {
//           console.error('Error fetching pending order items:', itemsError);
//           setPendingOrderItems([]);
//         }
//       } else {
//         setPendingOrderId(null);
//         setPendingOrderItems([]);
//         setPendingOrderTotal(0);
//         setItemAddOrder([]);
//       }
//     } catch (error) {
//       console.error('Order fetch error:', error?.response?.data || error.message);
//       setPendingOrderId(null);
//       setPendingOrderItems([]);
//       setPendingOrderTotal(0);
//       setItemAddOrder([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const autoAddToExistingOrder = async () => {
//     if (cartItems.length === 0) return;

//     const itemsToSend = cartItems.map(item => ({
//       product_id: parseInt(item.id),
//       quantity: parseInt(item.quantity),
//       price: parseFloat(item.unit_price || item.price)
//     }));

//     const invalidItems = itemsToSend.filter(item => 
//       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
//     );

//     if (invalidItems.length > 0) {
//       console.error('Invalid items detected:', invalidItems);
//       return;
//     }

//     const payload = {
//       delivery_address: address.trim() || 'Default Address',
//       items: itemsToSend
//     };

//     try {
//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       await checkPendingOrder();

//     } catch (error) {
//       console.error('Auto-add error:', error?.response?.data || error.message);
//     }
//   };

//   // ✅ NEW: Sync context when updating server quantity
//   const updateItemQuantity = async (productId, newQuantity) => {
//     if (!pendingOrderId) {
//       Alert.alert('Error', 'No pending order found');
//       return;
//     }

//     const productIdStr = productId.toString();
//     setUpdatingItems(prev => new Set(prev).add(productIdStr));

//     try {
//       const payload = {
//         delivery_address: address.trim() || 'Default Address',
//         items: [{
//           product_id: parseInt(productId),
//           quantity: newQuantity,
//           price: 0
//         }]
//       };

//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       // ✅ UPDATE CONTEXT: Sync the CartContext with server changes
//       if (newQuantity <= 0) {
//         // Remove ALL instances of this product from context
//         const itemsToRemove = cart.filter(item => item.id === productId).length;
//         for (let i = 0; i < itemsToRemove; i++) {
//           removeFromContext(productId);
//         }
        
//         setPendingOrderItems(prevItems => {
//           const filteredItems = prevItems.filter(item => item.product_id.toString() !== productIdStr);
//           return filteredItems;
//         });
//         setItemAddOrder(prevOrder => {
//           const filteredOrder = prevOrder.filter(id => id !== productIdStr);
//           return filteredOrder;
//         });
//         if (response.data.total_amount !== undefined) {
//           const newTotal = parseFloat(response.data.total_amount) || 0;
//           setPendingOrderTotal(newTotal);
//         }
//         if (response.data.items && response.data.items.length === 0) {
//           setPendingOrderId(null);
//           setPendingOrderItems([]);
//           setPendingOrderTotal(0);
//           setItemAddOrder([]);
//         }
//       } else {
//         await checkPendingOrder();
//       }

//     } catch (error) {
//       console.error('Update quantity error:', error?.response?.data || error.message);
//       const errorMessage = error?.response?.data?.message || 
//                           error?.response?.data?.error || 
//                           'Unable to update quantity. Please try again.';
//       Alert.alert('Update Failed', errorMessage);
//     } finally {
//       setUpdatingItems(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(productIdStr);
//         return newSet;
//       });
//     }
//   };

//   // ✅ FIXED: Now syncs with context
//   const decreaseQuantity = async (productId, currentQuantity) => {
//     const newQuantity = currentQuantity - 1;
    
//     // Remove one from context immediately for instant UI feedback
//     removeFromContext(productId);
    
//     if (newQuantity <= 0) {
//       await updateItemQuantity(productId, 0);
//     } else {
//       await updateItemQuantity(productId, newQuantity);
//     }
//   };

//   // ✅ FIXED: Increase also needs context sync
//   const increaseQuantity = async (productId, currentQuantity) => {
//     const newQuantity = currentQuantity + 1;
    
//     // We need to add to context, but we need the full item object
//     // Find the item in pendingOrderItems to get product details
//     const serverItem = pendingOrderItems.find(item => item.product_id === productId);
    
//     if (serverItem) {
//       // Add to context with product details
//       const itemToAdd = {
//         id: productId,
//         name: serverItem.product_name,
//         price: serverItem.unit_price || serverItem.price
//       };
      
//       // Note: You'll need to expose addItem in CartContext
//       // For now, we'll just update the server
//     }
    
//     await updateItemQuantity(productId, newQuantity);
//   };

//   const handleCheckout = async () => {
//     if (!address.trim()) {
//       return Alert.alert('Missing Address', 'Please enter a delivery address');
//     }

//     if (pendingOrderId) {
//       clearCart();
//       navigation.navigate('Payment', { 
//         order_id: pendingOrderId,
//         total_amount: pendingOrderTotal
//       });
//       return;
//     }

//     if (cartItems.length === 0) {
//       return Alert.alert('Cart Empty', 'Please add items to cart before checkout.');
//     }

//     const itemsToSend = cartItems.map(item => ({
//       product_id: parseInt(item.id),
//       quantity: parseInt(item.quantity),
//       price: parseFloat(item.unit_price || item.price)
//     }));

//     const invalidItems = itemsToSend.filter(item => 
//       !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
//     );

//     if (invalidItems.length > 0) {
//       console.error('Invalid items detected:', invalidItems);
//       return Alert.alert('Invalid Items', 'Some items in your cart are invalid. Please refresh and try again.');
//     }

//     const payload = {
//       delivery_address: address.trim(),
//       items: itemsToSend
//     };

//     try {
//       const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
//         headers: { 
//           Authorization: token,
//           'Content-Type': 'application/json'
//         }
//       });

//       const orderId = response.data.order_id;
//       const serverTotal = parseFloat(response.data.total_amount);
      
//       if (!orderId) {
//         throw new Error('No order ID received from server');
//       }

//       await checkPendingOrder();
//       clearCart();

//       navigation.navigate('Payment', { 
//         order_id: orderId,
//         total_amount: serverTotal
//       });

//     } catch (error) {
//       console.error('Checkout error:', error?.response?.data || error.message);
//       const errorMessage = error?.response?.data?.message || 
//                           error?.response?.data?.error || 
//                           'Unable to process checkout. Please try again.';
//       Alert.alert('Checkout Failed', errorMessage);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#00b894" />
//           <Text style={styles.loadingText}>Loading your cart...</Text>
//         </View>
//       </View>
//     );
//   }

//   const hasLocalItems = cartItems.length > 0;
//   const hasPendingItems = pendingOrderItems.length > 0;
  
//   let displayItems;
//   if (hasPendingItems) {
//     displayItems = [...pendingOrderItems].sort((a, b) => {
//       const aIndex = itemAddOrder.indexOf(a.product_id.toString());
//       const bIndex = itemAddOrder.indexOf(b.product_id.toString());
      
//       if (aIndex !== -1 && bIndex !== -1) {
//         return aIndex - bIndex;
//       }
      
//       if (aIndex !== -1) return -1;
//       if (bIndex !== -1) return 1;
      
//       return 0;
//     });
//   } else {
//     displayItems = cartItems;
//   }
  
//   const displayTotal = hasPendingItems ? pendingOrderTotal : localTotal;

//   if (!hasLocalItems && !hasPendingItems) {
//     return (
//       <View style={styles.centered}>
//         <View style={styles.emptyCartContainer}>
//           <Text style={styles.emptyCartIcon}>🛒</Text>
//           <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
//           <Text style={styles.emptyCartSubtitle}>Add some delicious items to get started</Text>
//           <TouchableOpacity
//             style={styles.continueShoppingButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.continueShoppingText}>Continue Shopping</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>
//           {hasPendingItems ? 'Order Review' : 'Shopping Cart'}
//         </Text>
//         <View style={styles.headerRight}>
//           <Text style={styles.itemCount}>{displayItems.length} items</Text>
//         </View>
//       </View>
      
//       <FlatList
//         data={displayItems}
//         keyExtractor={(item) => {
//           return item.product_id ? item.product_id.toString() : item.id.toString();
//         }}
//         renderItem={({ item, index }) => {
//           const isCartItem = !item.product_id;
//           const itemName = isCartItem ? item.name : item.product_name;
//           const itemId = isCartItem ? item.id : item.product_id;
//           const quantity = parseInt(item.quantity) || 1;
//           const itemIdStr = itemId.toString();
//           const isUpdating = updatingItems.has(itemIdStr);
          
//           let unitPrice, totalPrice;
//           if (isCartItem) {
//             unitPrice = parseFloat(item.unit_price || item.price);
//             totalPrice = unitPrice * quantity;
//           } else {
//             totalPrice = parseFloat(item.price);
//             unitPrice = parseFloat(item.unit_price) || (quantity > 0 ? totalPrice / quantity : 0);
//           }

//           return (
//             <View style={[
//               styles.cartItem, 
//               index === displayItems.length - 1 && styles.lastCartItem
//             ]}>
//               <View style={styles.itemContent}>
//                 <View style={styles.itemHeader}>
//                   <Text style={styles.itemName} numberOfLines={2}>
//                     {itemName || `Product ${itemId}`}
//                   </Text>
//                   {!isCartItem && (
//                     <TouchableOpacity
//                       style={styles.removeButton}
//                       onPress={() => decreaseQuantity(itemId, 1)}
//                       disabled={isUpdating}
//                     >
//                       <Text style={styles.removeButtonText}>✕</Text>
//                     </TouchableOpacity>
//                   )}
//                 </View>
                
//                 <View style={styles.priceContainer}>
//                   <Text style={styles.unitPrice}>₹{unitPrice.toFixed(2)} each</Text>
//                 </View>
                
//                 <View style={styles.bottomRow}>
//                   <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
                  
//                   {!isCartItem && (
//                     <View style={styles.quantityControls}>
//                       <TouchableOpacity
//                         style={[
//                           styles.quantityButton, 
//                           styles.decreaseButton,
//                           (isUpdating || quantity <= 1) && styles.disabledButton
//                         ]}
//                         onPress={() => decreaseQuantity(itemId, quantity)}
//                         disabled={isUpdating}
//                       >
//                         <Text style={styles.quantityButtonText}>−</Text>
//                       </TouchableOpacity>
                      
//                       <View style={styles.quantityDisplay}>
//                         {isUpdating ? (
//                           <ActivityIndicator size="small" color="#00b894" />
//                         ) : (
//                           <Text style={styles.quantityText}>{quantity}</Text>
//                         )}
//                       </View>
                      
//                       <TouchableOpacity
//                         style={[
//                           styles.quantityButton, 
//                           styles.increaseButton,
//                           isUpdating && styles.disabledButton
//                         ]}
//                         onPress={() => increaseQuantity(itemId, quantity)}
//                         disabled={isUpdating}
//                       >
//                         <Text style={styles.quantityButtonText}>+</Text>
//                       </TouchableOpacity>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>
//           );
//         }}
//         style={styles.itemsList}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.listContainer}
//       />

//       <View style={styles.bottomSection}>
//         <View style={styles.addressContainer}>
//           <Text style={styles.addressLabel}>Delivery Address</Text>
//           <TextInput
//             style={styles.addressInput}
//             placeholder="Enter your delivery address"
//             value={address}
//             onChangeText={setAddress}
//             multiline={true}
//             numberOfLines={2}
//             placeholderTextColor="#999"
//           />
//         </View>

//         <View style={styles.summaryContainer}>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Subtotal ({displayItems.length} items)</Text>
//             <Text style={styles.summaryValue}>₹{displayTotal.toFixed(2)}</Text>
//           </View>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>Delivery Fee</Text>
//             <Text style={styles.summaryValue}>FREE</Text>
//           </View>
//           <View style={[styles.summaryRow, styles.totalRow]}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <Text style={styles.totalValue}>₹{displayTotal.toFixed(2)}</Text>
//           </View>
//         </View>

//         <TouchableOpacity 
//           style={[
//             styles.checkoutButton,
//             loading && styles.disabledCheckoutButton
//           ]} 
//           onPress={handleCheckout}
//           disabled={loading}
//         >
//           <Text style={styles.checkoutButtonText}>
//             {pendingOrderId ? 'Proceed to Payment' : 'Place Order'}
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// // Styles remain the same as before...
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//   loadingContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
//   loadingText: { marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' },
//   header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
//   backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
//   backButtonText: { fontSize: 20, color: '#333', fontWeight: '600' },
//   headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
//   headerRight: { width: 40, alignItems: 'flex-end' },
//   itemCount: { fontSize: 12, color: '#00b894', fontWeight: '600', backgroundColor: '#e8f5f3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
//   listContainer: { padding: 16, paddingBottom: 0 },
//   cartItem: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
//   lastCartItem: { marginBottom: 8 },
//   itemContent: { flex: 1 },
//   itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
//   itemName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 12, lineHeight: 22 },
//   removeButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fee', justifyContent: 'center', alignItems: 'center' },
//   removeButtonText: { fontSize: 12, color: '#e74c3c', fontWeight: 'bold' },
//   priceContainer: { marginBottom: 12 },
//   unitPrice: { fontSize: 14, color: '#666', fontWeight: '500' },
//   bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#00b894' },
//   quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 24, padding: 4 },
//   quantityButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
//   decreaseButton: { backgroundColor: '#e8f5f3' },
//   increaseButton: { backgroundColor: '#00b894' },
//   disabledButton: { backgroundColor: '#ddd', opacity: 0.6 },
//   quantityButtonText: { fontSize: 16, fontWeight: 'bold' },
//   quantityDisplay: { minWidth: 40, height: 32, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
//   quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
//   bottomSection: { backgroundColor: '#fff', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 34, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
//   addressContainer: { marginBottom: 20 },
//   addressLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
//   addressInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 15, backgroundColor: '#fafafa', minHeight: 56, textAlignVertical: 'top', color: '#333' },
//   summaryContainer: { marginBottom: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
//   summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
//   summaryLabel: { fontSize: 15, color: '#666', fontWeight: '500' },
//   summaryValue: { fontSize: 15, color: '#333', fontWeight: '600' },
//   totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', marginBottom: 0 },
//   totalLabel: { fontSize: 18, color: '#333', fontWeight: 'bold' },
//   totalValue: { fontSize: 20, color: '#00b894', fontWeight: 'bold' },
//   checkoutButton: { backgroundColor: '#00b894', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 3, shadowColor: '#00b894', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
//   disabledCheckoutButton: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
//   checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
//   emptyCartContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginHorizontal: 20 },
//   emptyCartIcon: { fontSize: 64, marginBottom: 16 },
//   emptyCartTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
//   emptyCartSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
//   continueShoppingButton: { backgroundColor: '#00b894', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, elevation: 2, shadowColor: '#00b894', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
//   continueShoppingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
// });


import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';
import { CartContext } from './CartContext';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  // ✅ Get ALL cart functions from context
  const { cart, clearCart, removeItem, addItem } = useContext(CartContext);
  
  const [address, setAddress] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingOrderItems, setPendingOrderItems] = useState([]);
  const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [itemAddOrder, setItemAddOrder] = useState([]);
  const { token } = useContext(AuthContext);

  // Group products by ID for local cart
  const groupedCart = cart.reduce((acc, item) => {
    const itemId = item.id.toString();
    if (acc[itemId]) {
      acc[itemId].quantity += 1;
    } else {
      acc[itemId] = { 
        ...item, 
        quantity: 1,
        id: item.id,
        unit_price: parseFloat(item.price)
      };
    }
    return acc;
  }, {});

  const cartItems = Object.values(groupedCart);

  // Calculate local cart total
  const localTotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.unit_price || parseFloat(item.price);
    const quantity = parseInt(item.quantity) || 1;
    return sum + (unitPrice * quantity);
  }, 0);

  useEffect(() => {
    checkPendingOrder();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      setItemAddOrder(prevOrder => {
        const existingIds = new Set(prevOrder);
        const newItems = cartItems
          .filter(item => !existingIds.has(item.id.toString()))
          .map(item => item.id.toString());
        return [...prevOrder, ...newItems];
      });
    }
  }, [cartItems]);

  useEffect(() => {
    if (pendingOrderId && cartItems.length > 0) {
      autoAddToExistingOrder();
    }
  }, [cart, pendingOrderId]);

  const checkPendingOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.API_URL}/orders`, {
        headers: { Authorization: token },
      });
      
      const pending = response.data.orders?.find(order => order.status === 'pending');
      if (pending) {
        setPendingOrderId(pending.id);
        setPendingOrderTotal(parseFloat(pending.total_amount) || 0);

        try {
          const itemsResponse = await axios.get(`${CONFIG.API_URL}/orders/${pending.id}/items`, {
            headers: { Authorization: token }
          });
          
          const items = itemsResponse.data.items || [];
          setPendingOrderItems(items);
          
          setItemAddOrder(prevOrder => {
            const existingIds = new Set(prevOrder);
            const newServerItems = items
              .filter(item => !existingIds.has(item.product_id.toString()))
              .map(item => item.product_id.toString());
            return [...prevOrder, ...newServerItems];
          });
          
          setPendingOrderTotal(parseFloat(itemsResponse.data.total_amount) || parseFloat(pending.total_amount) || 0);
          
        } catch (itemsError) {
          console.error('Error fetching pending order items:', itemsError);
          setPendingOrderItems([]);
        }
      } else {
        setPendingOrderId(null);
        setPendingOrderItems([]);
        setPendingOrderTotal(0);
        setItemAddOrder([]);
      }
    } catch (error) {
      console.error('Order fetch error:', error?.response?.data || error.message);
      setPendingOrderId(null);
      setPendingOrderItems([]);
      setPendingOrderTotal(0);
      setItemAddOrder([]);
    } finally {
      setLoading(false);
    }
  };

  const autoAddToExistingOrder = async () => {
    if (cartItems.length === 0) return;

    const itemsToSend = cartItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.unit_price || item.price)
    }));

    const invalidItems = itemsToSend.filter(item => 
      !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
    );

    if (invalidItems.length > 0) {
      console.error('Invalid items detected:', invalidItems);
      return;
    }

    const payload = {
      delivery_address: address.trim() || 'Default Address',
      items: itemsToSend
    };

    try {
      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      await checkPendingOrder();

    } catch (error) {
      console.error('Auto-add error:', error?.response?.data || error.message);
    }
  };

  // ✅ Update server quantity AND sync with context
  const updateItemQuantity = async (productId, newQuantity) => {
    if (!pendingOrderId) {
      Alert.alert('Error', 'No pending order found');
      return;
    }

    const productIdStr = productId.toString();
    setUpdatingItems(prev => new Set(prev).add(productIdStr));

    try {
      const payload = {
        delivery_address: address.trim() || 'Default Address',
        items: [{
          product_id: parseInt(productId),
          quantity: newQuantity,
          price: 0
        }]
      };

      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      if (newQuantity <= 0) {
        // Remove ALL instances from context
        const itemsToRemove = cart.filter(item => item.id === productId).length;
        for (let i = 0; i < itemsToRemove; i++) {
          removeItem(productId);
        }
        
        setPendingOrderItems(prevItems => {
          const filteredItems = prevItems.filter(item => item.product_id.toString() !== productIdStr);
          return filteredItems;
        });
        setItemAddOrder(prevOrder => {
          const filteredOrder = prevOrder.filter(id => id !== productIdStr);
          return filteredOrder;
        });
        if (response.data.total_amount !== undefined) {
          const newTotal = parseFloat(response.data.total_amount) || 0;
          setPendingOrderTotal(newTotal);
        }
        if (response.data.items && response.data.items.length === 0) {
          setPendingOrderId(null);
          setPendingOrderItems([]);
          setPendingOrderTotal(0);
          setItemAddOrder([]);
        }
      } else {
        await checkPendingOrder();
      }

    } catch (error) {
      console.error('Update quantity error:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          'Unable to update quantity. Please try again.';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productIdStr);
        return newSet;
      });
    }
  };

  // ✅ Decrease for SERVER items - syncs with context
  const decreaseQuantity = async (productId, currentQuantity) => {
    const newQuantity = currentQuantity - 1;
    
    // Remove from context immediately
    removeItem(productId);
    
    if (newQuantity <= 0) {
      await updateItemQuantity(productId, 0);
    } else {
      await updateItemQuantity(productId, newQuantity);
    }
  };

  // ✅ Increase for SERVER items - syncs with context
  const increaseQuantity = async (productId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    
    // Find the item to get full details
    const serverItem = pendingOrderItems.find(item => item.product_id === productId);
    
    if (serverItem) {
      // Add to context immediately
      const itemToAdd = {
        id: productId,
        name: serverItem.product_name,
        price: serverItem.unit_price || (serverItem.price / currentQuantity)
      };
      addItem(itemToAdd);
    }
    
    await updateItemQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      return Alert.alert('Missing Address', 'Please enter a delivery address');
    }

    if (pendingOrderId) {
      clearCart();
      navigation.navigate('Payment', { 
        order_id: pendingOrderId,
        total_amount: pendingOrderTotal
      });
      return;
    }

    if (cartItems.length === 0) {
      return Alert.alert('Cart Empty', 'Please add items to cart before checkout.');
    }

    const itemsToSend = cartItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.unit_price || item.price)
    }));

    const invalidItems = itemsToSend.filter(item => 
      !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
    );

    if (invalidItems.length > 0) {
      console.error('Invalid items detected:', invalidItems);
      return Alert.alert('Invalid Items', 'Some items in your cart are invalid. Please refresh and try again.');
    }

    const payload = {
      delivery_address: address.trim(),
      items: itemsToSend
    };

    try {
      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      const orderId = response.data.order_id;
      const serverTotal = parseFloat(response.data.total_amount);
      
      if (!orderId) {
        throw new Error('No order ID received from server');
      }

      await checkPendingOrder();
      clearCart();

      navigation.navigate('Payment', { 
        order_id: orderId,
        total_amount: serverTotal
      });

    } catch (error) {
      console.error('Checkout error:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          'Unable to process checkout. Please try again.';
      Alert.alert('Checkout Failed', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b894" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </View>
    );
  }

  const hasLocalItems = cartItems.length > 0;
  const hasPendingItems = pendingOrderItems.length > 0;
  
  let displayItems;
  if (hasPendingItems) {
    displayItems = [...pendingOrderItems].sort((a, b) => {
      const aIndex = itemAddOrder.indexOf(a.product_id.toString());
      const bIndex = itemAddOrder.indexOf(b.product_id.toString());
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return 0;
    });
  } else {
    displayItems = cartItems;
  }
  
  const displayTotal = hasPendingItems ? pendingOrderTotal : localTotal;

  if (!hasLocalItems && !hasPendingItems) {
    return (
      <View style={styles.centered}>
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartIcon}>🛒</Text>
          <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtitle}>Add some delicious items to get started</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {hasPendingItems ? 'Order Review' : 'Shopping Cart'}
        </Text>
        <View style={styles.headerRight}>
          <Text style={styles.itemCount}>{displayItems.length} items</Text>
        </View>
      </View>
      
      <FlatList
        data={displayItems}
        keyExtractor={(item) => {
          return item.product_id ? item.product_id.toString() : item.id.toString();
        }}
        renderItem={({ item, index }) => {
          // ✅ Determine if this is a local cart item or server item
          const isCartItem = !item.product_id;
          const itemName = isCartItem ? item.name : item.product_name;
          const itemId = isCartItem ? item.id : item.product_id;
          const quantity = parseInt(item.quantity) || 1;
          const itemIdStr = itemId.toString();
          const isUpdating = updatingItems.has(itemIdStr);
          
          let unitPrice, totalPrice;
          if (isCartItem) {
            unitPrice = parseFloat(item.unit_price || item.price);
            totalPrice = unitPrice * quantity;
          } else {
            totalPrice = parseFloat(item.price);
            unitPrice = parseFloat(item.unit_price) || (quantity > 0 ? totalPrice / quantity : 0);
          }

          return (
            <View style={[
              styles.cartItem, 
              index === displayItems.length - 1 && styles.lastCartItem
            ]}>
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {itemName || `Product ${itemId}`}
                  </Text>
                  {/* ✅ Remove button - works for BOTH local and server items */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      if (isCartItem) {
                        // Remove all instances of local item
                        for (let i = 0; i < quantity; i++) {
                          removeItem(itemId);
                        }
                      } else {
                        // Remove server item (sets to 0)
                        decreaseQuantity(itemId, 1);
                      }
                    }}
                    disabled={isUpdating}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.unitPrice}>₹{unitPrice.toFixed(2)} each</Text>
                </View>
                
                <View style={styles.bottomRow}>
                  <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
                  
                  {/* ✅ SHOW QUANTITY CONTROLS FOR BOTH LOCAL AND SERVER ITEMS */}
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton, 
                        styles.decreaseButton,
                        isUpdating && styles.disabledButton
                      ]}
                      onPress={() => {
                        if (isCartItem) {
                          // Decrease local cart item
                          removeItem(itemId);
                        } else {
                          // Decrease server item
                          decreaseQuantity(itemId, quantity);
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.quantityDisplay}>
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#00b894" />
                      ) : (
                        <Text style={styles.quantityText}>{quantity}</Text>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.quantityButton, 
                        styles.increaseButton,
                        isUpdating && styles.disabledButton
                      ]}
                      onPress={() => {
                        if (isCartItem) {
                          // Increase local cart item
                          addItem(item);
                        } else {
                          // Increase server item
                          increaseQuantity(itemId, quantity);
                        }
                      }}
                      disabled={isUpdating}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
        style={styles.itemsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.bottomSection}>
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
          <TextInput
            style={styles.addressInput}
            placeholder="Enter your delivery address"
            value={address}
            onChangeText={setAddress}
            multiline={true}
            numberOfLines={2}
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({displayItems.length} items)</Text>
            <Text style={styles.summaryValue}>₹{displayTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>FREE</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{displayTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            loading && styles.disabledCheckoutButton
          ]} 
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutButtonText}>
            {pendingOrderId ? 'Proceed to Payment' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 20, color: '#333', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1, textAlign: 'center' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  itemCount: { fontSize: 12, color: '#00b894', fontWeight: '600', backgroundColor: '#e8f5f3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  listContainer: { padding: 16, paddingBottom: 0 },
  cartItem: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 12, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  lastCartItem: { marginBottom: 8 },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#333', flex: 1, marginRight: 12, lineHeight: 22 },
  removeButton: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fee', justifyContent: 'center', alignItems: 'center' },
  removeButtonText: { fontSize: 12, color: '#e74c3c', fontWeight: 'bold' },
  priceContainer: { marginBottom: 12 },
  unitPrice: { fontSize: 14, color: '#666', fontWeight: '500' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#00b894' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 24, padding: 4 },
  quantityButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  decreaseButton: { backgroundColor: '#e8f5f3' },
  increaseButton: { backgroundColor: '#00b894' },
  disabledButton: { backgroundColor: '#ddd', opacity: 0.6 },
  quantityButtonText: { fontSize: 16, fontWeight: 'bold' },
  quantityDisplay: { minWidth: 40, height: 32, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  quantityText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  bottomSection: { backgroundColor: '#fff', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 34, borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  addressContainer: { marginBottom: 20 },
  addressLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  addressInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, padding: 16, fontSize: 15, backgroundColor: '#fafafa', minHeight: 56, textAlignVertical: 'top', color: '#333' },
  summaryContainer: { marginBottom: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 15, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 15, color: '#333', fontWeight: '600' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0', marginBottom: 0 },
  totalLabel: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  totalValue: { fontSize: 20, color: '#00b894', fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#00b894', paddingVertical: 16, borderRadius: 16, alignItems: 'center', elevation: 3, shadowColor: '#00b894', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  disabledCheckoutButton: { backgroundColor: '#ccc', elevation: 0, shadowOpacity: 0 },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  emptyCartContainer: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, marginHorizontal: 20 },
  emptyCartIcon: { fontSize: 64, marginBottom: 16 },
  emptyCartTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptyCartSubtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  continueShoppingButton: { backgroundColor: '#00b894', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, elevation: 2, shadowColor: '#00b894', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  continueShoppingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});