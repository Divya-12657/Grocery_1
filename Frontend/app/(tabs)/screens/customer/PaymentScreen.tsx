
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

//   const upiApps = [
//     { name: 'PhonePe', package: 'com.phonepe.app' },
//     { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user' },
//   ];

//   useEffect(() => {
//     fetchOrders();
//   }, [token]);

//   const fetchOrders = async () => {
//     if (!token) {
//       setLoading(false);
//       Alert.alert('Error', 'You need to be logged in to view orders');
//       return;
//     }

//     try {
//       const res = await fetch(`${CONFIG.API_URL}/orders`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: token,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         const pendingOrders = data.orders.filter(order => order.status === 'pending');
//         setOrders(pendingOrders);
//       } else {
//         Alert.alert('Error', data.message || 'Failed to load orders');
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       Alert.alert('Error', 'Could not fetch orders');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async (order, app) => {
//     if (!token) {
//       Alert.alert('Error', 'You need to be logged in to make payments');
//       return;
//     }

//     try {
//       const res = await fetch(`${CONFIG.API_URL}/payment`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: token,
//         },
//         body: JSON.stringify({
//           order_id: order.id,
//           amount: order.total_amount.toString(),
//           payment_method: 'upi',
//           upi_details: upiDetails,
//           app_name: app.name,
//           app_package: app.package
//         }),
//       });

//       const result = await res.json();

//       if (res.ok && result.upi_link) {
//         // Use the UPI link returned from the backend
//         Linking.openURL(result.upi_link).catch(() => {
//           Alert.alert('Error', `${app.name} is not installed or failed to open`);
//         });
//       } else {
//         Alert.alert('Error', result.message || 'Payment failed');
//       }
//     } catch (err) {
//       console.error('Payment error:', err);
//       Alert.alert('Error', 'Payment request failed');
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
//   }

//   if (orders.length === 0) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>No pending orders to pay.</Text>
//         <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
//           <Text style={styles.refreshButtonText}>Refresh Orders</Text>
//         </TouchableOpacity>
//       </View>
//     );
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

//             <Text style={{ marginTop: 10, fontWeight: '600' }}>Pay using:</Text>
//             <View style={styles.appButtonsContainer}>
//               {upiApps.map(app => (
//                 <TouchableOpacity
//                   key={app.name}
//                   style={styles.appButton}
//                   onPress={() => handlePayment(item, app)}
//                 >
//                   <Text style={styles.appButtonText}>{app.name}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
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
//     flex: 1,
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
//   appButtonsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 8,
//   },
//   appButton: {
//     backgroundColor: '#673AB7',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 5,
//     marginRight: 8,
//     marginTop: 5,
//   },
//   appButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     padding: 16,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   refreshButton: {
//     backgroundColor: '#2196F3',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 5,
//   },
//   refreshButtonText: {
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

const PaymentScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get orderId from navigation params if available
  const orderId = route.params?.order_id;

  const upiDetails = {
    payee_vpa: '9945277470@ibl',
    payee_name: 'divya',
  };

  const upiApps = [
    { name: 'PhonePe', package: 'com.phonepe.app' },
    { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user' },
  ];

  useEffect(() => {
    if (orderId) {
      // If order_id was passed directly, fetch that specific order
      fetchSpecificOrder(orderId);
    } else {
      // Otherwise fetch pending orders
      fetchPendingOrders();
    }
  }, [token, orderId]);

  const fetchSpecificOrder = async (id) => {
    if (!token) {
      setLoading(false);
      Alert.alert('Error', 'You need to be logged in to view orders');
      return;
    }

    try {
      const res = await fetch(`${CONFIG.API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Find the specific order
        const order = data.orders.find(o => o.id === id);
        if (order) {
          setPendingOrder(order);
        } else {
          Alert.alert('Error', 'Order not found');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Could not fetch order');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    if (!token) {
      setLoading(false);
      Alert.alert('Error', 'You need to be logged in to view orders');
      return;
    }

    try {
      const res = await fetch(`${CONFIG.API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Find the first pending order
        const pendingOrder = data.orders.find(order => order.status === 'pending');
        setPendingOrder(pendingOrder || null);
      } else {
        Alert.alert('Error', data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Error', 'Could not fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order, app) => {
    if (!token) {
      Alert.alert('Error', 'You need to be logged in to make payments');
      return;
    }

    try {
      const res = await fetch(`${CONFIG.API_URL}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          order_id: order.id,
          payment_method: 'upi',
          upi_details: upiDetails,
          app_name: app.name,
          app_package: app.package
        }),
      });

      const result = await res.json();

      if (res.ok && result.upi_link) {
        // Use the UPI link returned from the backend
        Linking.openURL(result.upi_link).catch(() => {
          Alert.alert('Error', `${app.name} is not installed or failed to open`);
        });
        
        // After payment initiated, we should handle payment confirmation
        // This could be added with a webhook or manual confirmation
        // For now, we can assume payment will be completed
        setTimeout(() => {
          Alert.alert(
            'Payment Status',
            'Did you complete the payment?',
            [
              {
                text: 'No',
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => confirmPayment(order.id),
              },
            ],
            { cancelable: false }
          );
        }, 5000); // Give user 5 seconds to process payment
      } else {
        Alert.alert('Error', result.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'Payment request failed');
    }
  };
  
  const confirmPayment = async (orderId) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          order_id: orderId
        }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        Alert.alert('Success', 'Payment confirmed successfully!', [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Home')  // Navigate back to home screen
          }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to confirm payment');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      Alert.alert('Error', 'Could not confirm payment');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#673AB7" />
      </View>
    );
  }

  if (!pendingOrder) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pending orders to pay.</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchPendingOrders}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.refreshButton, { marginTop: 10, backgroundColor: '#4CAF50' }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.refreshButtonText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Payment</Text>
      <View style={styles.card}>
        <Text style={styles.orderText}>Order ID: {pendingOrder.id}</Text>
        <Text style={styles.detailText}>Status: {pendingOrder.status}</Text>
        <Text style={styles.amountText}>Amount: ₹{pendingOrder.total_amount}</Text>
        <Text style={styles.addressText}>Delivery: {pendingOrder.delivery_address}</Text>

        <Text style={styles.payMethodText}>Pay using:</Text>
        <View style={styles.appButtonsContainer}>
          {upiApps.map(app => (
            <TouchableOpacity
              key={app.name}
              style={styles.appButton}
              onPress={() => handlePayment(pendingOrder, app)}
            >
              <Text style={styles.appButtonText}>{app.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 6,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#673AB7',
    marginVertical: 10,
  },
  addressText: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  payMethodText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  appButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  appButton: {
    backgroundColor: '#673AB7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  appButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
