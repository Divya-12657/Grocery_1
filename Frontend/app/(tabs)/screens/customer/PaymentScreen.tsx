// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   Alert,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Linking,
// } from 'react-native';
// import { AuthContext } from '../../AuthContext';
// import CONFIG from '../../../config';

// const PaymentScreen = () => {
//   const { token } = useContext(AuthContext);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const upiDetails = {
//     payee_vpa: '9945277470@ibl',
//     payee_name: 'divya',
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, [token]);

//     const fetchOrders = async () => {
//       if (!token) {
//         setLoading(false);
//         Alert.alert('Error', 'You need to be logged in to view orders');
//         return;
//       }
//       try {
//         console.log('Fetching orders for payments...');
//         const res = await fetch(`${CONFIG.API_URL}/orders`, {
//           method: 'GET',
//           headers: {
//           'Content-Type': 'application/json',
//           Authorization:token,
//           },
//         });
//         const data = await res.json();
        
//         if (res.ok) {
//           setOrders(data.orders.filter(order => order.status === 'pending'));
//         } else {
//           Alert.alert('Error', data.message || 'Failed to load orders');
//         }
//       } catch (err) {
//         console.error(err);
//         Alert.alert('Error', 'Could not fetch orders');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [token]);

//   const handlePayment = async (order) => {
//     try {
//       const res = await fetch(`${CONFIG.API_URL}/payment`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization:`${token}`,
//         },
//         body: JSON.stringify({
//           order_id: order.id,
//           amount: order.total_amount.toString(),
//           payment_method: 'upi',
//           upi_details: upiDetails,
//         }),
//       });

//       const result = await res.json();
//       if (res.ok) {
//         Linking.openURL(result.upi_link);
//       } else {
//         Alert.alert('Error', result.message || 'Payment failed');
//       }
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Payment request failed');
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
//   }

//   if (orders.length === 0) {
//     return <Text style={{ padding: 20 }}>No pending orders to pay.</Text>;
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Pending Orders</Text>
//       <FlatList
//         data={orders}
//         keyExtractor={(item) => item.id.toString()}
//         renderItem={({ item }) => (
//           <View style={styles.card}>
//             <Text style={styles.orderText}>Order ID: {item.id}</Text>
//             <Text>Status: {item.status}</Text>
//             <Text>Total: ₹{item.total_amount}</Text>
//             <TouchableOpacity
//               style={styles.payButton}
//               onPress={() => handlePayment(item)}
//             >
//               <Text style={styles.payButtonText}>Pay Now</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       />
//     </View>
//   );
// };

// export default PaymentScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     gap: 12,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 12,
//   },
//   card: {
//     padding: 12,
//     backgroundColor: '#f0f0f0',
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   orderText: {
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   payButton: {
//     marginTop: 10,
//     backgroundColor: '#4CAF50',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   payButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import CONFIG from '../../../config';

const PaymentScreen = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const upiDetails = {
    payee_vpa: '9945277470@ibl',
    payee_name: 'divya',
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      Alert.alert('Error', 'You need to be logged in to view orders');
      return;
    }

    try {
      console.log('Fetching orders for payments...');
      const res = await fetch(`${CONFIG.API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token, // Should already have 'Bearer ' prefix
        },
      });
      
      const data = await res.json();
      
      if (res.ok) {
        console.log(`Found ${data.orders.length} orders, filtering for pending...`);
        const pendingOrders = data.orders.filter(order => order.status === 'pending');
        console.log(`Found ${pendingOrders.length} pending orders`);
        setOrders(pendingOrders);
      } else {
        console.error('API returned error:', data);
        Alert.alert('Error', data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Exception in fetchOrders:', err);
      Alert.alert('Error', 'Could not fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order) => {
    if (!token) {
      Alert.alert('Error', 'You need to be logged in to make payments');
      return;
    }

    try {
      console.log(`Requesting payment for order #${order.id}, amount: ${order.total_amount}`);
      const res = await fetch(`${CONFIG.API_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          order_id: order.id,
          amount: order.total_amount.toString(),
          payment_method: 'upi',
          upi_details: upiDetails,
        }),
      });

      const result = await res.json();
      
      if (res.ok) {
        console.log('Payment link generated:', result.upi_link);
        Linking.openURL(result.upi_link);
      } else {
        console.error('Payment API error:', result);
        Alert.alert('Error', result.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Exception in handlePayment:', err);
      Alert.alert('Error', 'Payment request failed');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pending orders to pay.</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Text style={styles.refreshButtonText}>Refresh Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderText}>Order ID: {item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: ₹{item.total_amount}</Text>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayment(item)}
            >
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  orderText: {
    fontWeight: '600',
    fontSize: 16,
  },
  payButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

