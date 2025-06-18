import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';

export default function CartScreen({ route, navigation }) {
  const { cart = [] } = route.params || {};
  const [address, setAddress] = useState('');
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [pendingOrderItems, setPendingOrderItems] = useState([]);
  const [pendingOrderTotal, setPendingOrderTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState(new Set()); // Track items being updated
  const [itemAddOrder, setItemAddOrder] = useState([]); // Track the order items were added
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
        unit_price: parseFloat(item.price) // Ensure it's a number
      };
    }
    return acc;
  }, {});

  const cartItems = Object.values(groupedCart);

  // Calculate local cart total - ALWAYS use unit_price * quantity
  const localTotal = cartItems.reduce((sum, item) => {
    const unitPrice = item.unit_price || parseFloat(item.price);
    const quantity = parseInt(item.quantity) || 1;
    return sum + (unitPrice * quantity);
  }, 0);

  useEffect(() => {
    checkPendingOrder();
  }, []);

  // Track the order of items as they're added from the cart
  useEffect(() => {
    if (cartItems.length > 0) {
      // Update the add order with new items from cart, preserving existing order
      setItemAddOrder(prevOrder => {
        const existingIds = new Set(prevOrder);
        const newItems = cartItems
          .filter(item => !existingIds.has(item.id.toString()))
          .map(item => item.id.toString());
        return [...prevOrder, ...newItems];
      });
    }
  }, [cartItems]);

  // NEW: Auto-add items to existing order when cart changes
  useEffect(() => {
    if (pendingOrderId && cartItems.length > 0) {
      autoAddToExistingOrder();
    }
  }, [cart, pendingOrderId]); // Trigger when cart or pendingOrderId changes

  const checkPendingOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${CONFIG.API_URL}/orders`, {
        headers: { Authorization: token },
      });
      
      const pending = response.data.orders?.find(order => order.status === 'pending');
      if (pending) {
        setPendingOrderId(pending.id);
        // Store the total from the order directly
        setPendingOrderTotal(parseFloat(pending.total_amount) || 0);

        // Fetch pending order items for display
        try {
          const itemsResponse = await axios.get(`${CONFIG.API_URL}/orders/${pending.id}/items`, {
            headers: { Authorization: token }
          });
          
          const items = itemsResponse.data.items || [];
          setPendingOrderItems(items);
          
          // Update item add order with any new items from server that we haven't tracked yet
          setItemAddOrder(prevOrder => {
            const existingIds = new Set(prevOrder);
            const newServerItems = items
              .filter(item => !existingIds.has(item.product_id.toString()))
              .map(item => item.product_id.toString());
            return [...prevOrder, ...newServerItems];
          });
          
          // Double-check total calculation matches server
          const calculatedTotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.total_price_for_item) || parseFloat(item.price) || 0);
          }, 0);
          
          console.log('Server total:', itemsResponse.data.total_amount);
          console.log('Calculated total:', calculatedTotal);
          console.log('Pending order total from orders list:', pending.total_amount);
          
          // Use server's total for consistency
          setPendingOrderTotal(parseFloat(itemsResponse.data.total_amount) || parseFloat(pending.total_amount) || 0);
          
        } catch (itemsError) {
          console.error('Error fetching pending order items:', itemsError);
          setPendingOrderItems([]);
        }
      } else {
        setPendingOrderId(null);
        setPendingOrderItems([]);
        setPendingOrderTotal(0);
        // Clear the add order when no pending order exists
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

  // NEW: Auto-add items to existing order
  const autoAddToExistingOrder = async () => {
    if (cartItems.length === 0) return;

    // Prepare items payload - send unit price for server validation
    const itemsToSend = cartItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.unit_price || item.price) // Send unit price
    }));

    // Validate payload
    const invalidItems = itemsToSend.filter(item => 
      !item.product_id || item.quantity <= 0 || item.price <= 0 || isNaN(item.price)
    );

    if (invalidItems.length > 0) {
      console.error('Invalid items detected:', invalidItems);
      return;
    }

    const payload = {
      delivery_address: address.trim() || 'Default Address', // Use existing address or default
      items: itemsToSend
    };

    console.log('Auto-adding to existing order:', JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      console.log('Auto-add response:', response.data);

      // Refresh the pending order items to show updated cart
      await checkPendingOrder();

    } catch (error) {
      console.error('Auto-add error:', error?.response?.data || error.message);
      // Don't show alert for auto-add failures, just log them
    }
  };

  // NEW: Function to update item quantity
  const updateItemQuantity = async (productId, newQuantity) => {
    if (!pendingOrderId) {
      Alert.alert('Error', 'No pending order found');
      return;
    }

    // Add to updating set to show loading state - ensure productId is a string
    const productIdStr = productId.toString();
    setUpdatingItems(prev => new Set(prev).add(productIdStr));

    try {
      const payload = {
        delivery_address: address.trim() || 'Default Address',
        items: [{
          product_id: parseInt(productId),
          quantity: newQuantity,
          price: 0 // Server will validate and use actual price
        }]
      };

      console.log('Updating quantity:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      console.log('Update quantity response:', response.data);

      // Refresh the pending order items to show updated quantities
      await checkPendingOrder();

    } catch (error) {
      console.error('Update quantity error:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          'Unable to update quantity. Please try again.';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      // Remove from updating set - ensure productId is a string
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productIdStr);
        return newSet;
      });
    }
  };

  // NEW: Function to remove item from order tracking when deleted
  const removeItemFromOrder = (productId) => {
    setItemAddOrder(prevOrder => 
      prevOrder.filter(id => id !== productId.toString())
    );
  };

  // NEW: Function to decrease quantity by 1
  const decreaseQuantity = async (productId, currentQuantity) => {
    const newQuantity = currentQuantity - 1;
    
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'This will remove the item from your order. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: async () => {
              await updateItemQuantity(productId, 0);
              removeItemFromOrder(productId);
            }
          }
        ]
      );
    } else {
      await updateItemQuantity(productId, newQuantity);
    }
  };

  // NEW: Function to increase quantity by 1
  const increaseQuantity = async (productId, currentQuantity) => {
    const newQuantity = currentQuantity + 1;
    await updateItemQuantity(productId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      return Alert.alert('Missing Address', 'Please enter a delivery address');
    }

    // If we have a pending order, just navigate to payment
    if (pendingOrderId) {
      navigation.navigate('Payment', { 
        order_id: pendingOrderId,
        total_amount: pendingOrderTotal
      });
      return;
    }

    // Otherwise, create new order (this case should be rare now)
    if (cartItems.length === 0) {
      return Alert.alert('Cart Empty', 'Please add items to cart before checkout.');
    }

    // Prepare items payload - send unit price for server validation
    const itemsToSend = cartItems.map(item => ({
      product_id: parseInt(item.id),
      quantity: parseInt(item.quantity),
      price: parseFloat(item.unit_price || item.price) // Send unit price
    }));

    // Validate payload
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

    console.log('Sending checkout payload:', JSON.stringify(payload, null, 2));
    console.log('Expected local total:', localTotal.toFixed(2));

    try {
      const response = await axios.post(`${CONFIG.API_URL}/orders`, payload, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });

      console.log('Checkout response:', response.data);

      const orderId = response.data.order_id;
      const serverTotal = parseFloat(response.data.total_amount);
      
      console.log('Server returned total:', serverTotal);
      console.log('Local calculated total:', localTotal);
      
      if (!orderId) {
        throw new Error('No order ID received from server');
      }

      // Refresh pending order info after successful checkout
      await checkPendingOrder();

      // Navigate to payment screen with the order ID and correct total
      navigation.navigate('Payment', { 
        order_id: orderId,
        total_amount: serverTotal // Pass server total to payment screen
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
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  // Determine what to display
  const hasLocalItems = cartItems.length > 0;
  const hasPendingItems = pendingOrderItems.length > 0;
  
  // Always show pending items if they exist, but sort them by add order
  let displayItems;
  if (hasPendingItems) {
    // Sort pending items by the order they were added
    displayItems = [...pendingOrderItems].sort((a, b) => {
      const aIndex = itemAddOrder.indexOf(a.product_id.toString());
      const bIndex = itemAddOrder.indexOf(b.product_id.toString());
      
      // If both items are in the order array, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in the order array, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in the order array, maintain original order
      return 0;
    });
  } else {
    displayItems = cartItems;
  }
  
  const displayTotal = hasPendingItems ? pendingOrderTotal : localTotal;

  if (!hasLocalItems && !hasPendingItems) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyCartText}>Your cart is empty</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, { marginTop: 20 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        {hasPendingItems ? 'Your Order Items' : 'Cart Items'}
      </Text>
      
      <FlatList
        data={displayItems}
        keyExtractor={(item) => {
          return item.product_id ? item.product_id.toString() : item.id.toString();
        }}
        renderItem={({ item }) => {
          // Handle display for both cart items and pending order items
          const isCartItem = !item.product_id;
          const itemName = isCartItem ? item.name : item.product_name;
          const itemId = isCartItem ? item.id : item.product_id;
          const quantity = parseInt(item.quantity) || 1;
          // Ensure consistent string representation for tracking updates
          const itemIdStr = itemId.toString();
          const isUpdating = updatingItems.has(itemIdStr);
          
          let unitPrice, totalPrice;
          if (isCartItem) {
            unitPrice = parseFloat(item.unit_price || item.price);
            totalPrice = unitPrice * quantity;
          } else {
            // Pending order item - use server provided values
            totalPrice = parseFloat(item.price);
            unitPrice = parseFloat(item.unit_price) || (quantity > 0 ? totalPrice / quantity : 0);
          }

          return (
            <View style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {itemName || `Product ${itemId}`}
                </Text>
                <Text style={styles.itemPrice}>
                  ${unitPrice.toFixed(2)} × {quantity}
                </Text>
                <Text style={styles.itemTotal}>
                  Total: ${totalPrice.toFixed(2)}
                </Text>
              </View>
              
              {/* Quantity Controls - Only show for pending order items */}
              {!isCartItem && (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                    onPress={() => decreaseQuantity(itemId, quantity)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.quantityDisplay}>
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#4CAF50" />
                    ) : (
                      <Text style={styles.quantityText}>{quantity}</Text>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.quantityButton, isUpdating && styles.disabledButton]}
                    onPress={() => increaseQuantity(itemId, quantity)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        style={styles.itemsList}
      />

      <View style={styles.checkoutSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter delivery address"
          value={address}
          onChangeText={setAddress}
          multiline={true}
          numberOfLines={2}
        />

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            Total: ${displayTotal.toFixed(2)}
          </Text>
          
          {/* Debug info - remove in production */}
          {__DEV__ && (
            <Text style={styles.debugText}>
              {hasPendingItems ? 'Order Total (Updated)' : 'Local Cart Total'}
            </Text>
          )}
          
          <TouchableOpacity 
            style={styles.checkoutButton} 
            onPress={handleCheckout}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {pendingOrderId ? 'Proceed to Payment' : 'Place Order & Pay'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemsList: {
    flex: 1,
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 4,
    marginLeft: 10,
  },
  quantityButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityDisplay: {
    minWidth: 40,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fafafa',
    fontSize: 16,
    minHeight: 50,
  },
  totalContainer: {
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  paymentButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
});

// UpdatedCartScreen.tsx

