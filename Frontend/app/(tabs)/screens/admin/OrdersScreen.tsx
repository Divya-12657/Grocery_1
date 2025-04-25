
// import React, { useContext, useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
// import axios from 'axios';
// import CONFIG from '../../../config';
// import { AuthContext } from '../../AuthContext';

// const OrderScreen = () => {
//   const { token } = useContext(AuthContext);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = async () => {
//     if (!token) {
//       Alert.alert('Unauthorized', 'No token found. Please log in again.');
//       return;
//     }

//     try {
//       const response = await axios.get(`${CONFIG.API_URL}/orders`, {
//         headers: {
//           Authorization: token, // Already includes "Bearer"
//         },
//       });
//       setOrders(response.data.orders || response.data); // Handle both formats
//     } catch (error) {
//       console.error('Failed to fetch orders:', error.response?.data || error.message);
//       Alert.alert('Error', 'Failed to fetch orders. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>Order #{item.id}</Text>
//       <Text>Customer: {item.customer_name}</Text>
//       <Text>Total: ₹{item.total_price}</Text>
//       <Text>Status: {item.status}</Text>
//     </View>
//   );

//   if (loading) {
//     return <ActivityIndicator size="large" style={{ flex: 1 }} />;
//   }

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={renderItem}
//         ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
//       />
//     </View>
//   );
// };

// export default OrderScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 15,
//     backgroundColor: '#fff',
//   },
//   card: {
//     backgroundColor: '#f2f2f2',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   title: {
//     fontWeight: 'bold',
//     marginBottom: 5,
//   },
//   empty: {
//     textAlign: 'center',
//     marginTop: 20,
//     fontSize: 16,
//   },
// });

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../AuthContext'; // Correct import for AuthContext
import CONFIG from '../../../config';

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

const OrderScreen = () => {
  const { token } = useContext(AuthContext); // Use useContext to access AuthContext
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<{ [orderId: number]: boolean }>({});
  const [orderItemsMap, setOrderItemsMap] = useState<{ [orderId: number]: OrderItem[] }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${CONFIG.API_URL}/orders`, {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data && data.orders) {
        setOrders(data.orders); // Set orders from the response data
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/admin/orders/${orderId}/items`, {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data && data.items) {
        setOrderItemsMap((prevState) => ({
          ...prevState,
          [orderId]: data.items, // Set order items in the map
        }));
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const toggleOrderExpand = (orderId: number) => {
    setExpandedOrders((prevState) => ({
      ...prevState,
      [orderId]: !prevState[orderId],
    }));
    if (!expandedOrders[orderId]) {
      fetchOrderItems(orderId); // Fetch order items only when expanding the order
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const orderItems = orderItemsMap[item.id];
    const isExpanded = expandedOrders[item.id];

    return (
      <View style={styles.orderContainer}>
        <Text style={styles.orderTitle}>
          Order #{item.id} - {item.status}
        </Text>
        <Text style={styles.orderDetail}>Total: ${item.total_amount}</Text>
        <Text style={styles.orderDetail}>Address: {item.delivery_address}</Text>
        <Text style={styles.orderDetail}>Created at: {new Date(item.created_at).toLocaleString()}</Text>

        <TouchableOpacity onPress={() => toggleOrderExpand(item.id)}>
          <Text style={styles.toggleText}>{isExpanded ? 'Hide Items' : 'Show Items'}</Text>
        </TouchableOpacity>

        {isExpanded && orderItems && orderItems.length > 0 && (

<FlatList
data={orderItems}
keyExtractor={(orderItem) => orderItem?.id?.toString() || 'default_key'} // Safe access
renderItem={({ item }) => (
  <View style={styles.orderItemContainer}>
    <Text>{item.product_name}</Text>
    <Text>Quantity: {item.quantity}</Text>
    <Text>Price: ${item.price}</Text>
  </View>
)}
/>
  
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order.id.toString()}
      renderItem={renderOrderItem}
    />
  );
};

const styles = StyleSheet.create({
  orderContainer: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderDetail: {
    fontSize: 14,
    color: '#555',
  },
  toggleText: {
    color: 'blue',
    marginTop: 10,
  },
  orderItemContainer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderScreen;
