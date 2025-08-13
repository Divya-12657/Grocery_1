
// import React, { useEffect, useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { AuthContext } from '../../AuthContext';
// import CONFIG from '../../../config';
// import { useNavigation } from '@react-navigation/native';

// interface Order {
//   id: number;
//   user_id: number;
//   total_amount: number;
//   status: string;
//   created_at: string;
//   delivery_address: string;
// }

// const Delivery_Screen = () => {
//   const { token, logout } = useContext(AuthContext);
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(false);
//   const navigation = useNavigation();

//   useEffect(() => {
//     if (token) fetchOrders();
//   }, [token]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${CONFIG.API_URL}/delivery/orders`, {
//         headers: {
//           Authorization: `${token}`,
//         },
//       });
//       const data = await response.json();
//       if (data?.orders) {
//         setOrders(data.orders);
//       } else {
//         Alert.alert('No orders', 'No delivery orders found.');
//       }
//     } catch (err) {
//       console.error('Failed to fetch orders', err);
//       Alert.alert('Error', 'Unable to fetch delivery orders.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateOrderStatus = async (orderId: number, newStatus: string) => {
//     try {
//       const response = await fetch(`${CONFIG.API_URL}/delivery/orders/${orderId}/update`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `${token}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       });

//       const data = await response.json();
//       Alert.alert(data.message || 'Order status updated');
//       fetchOrders(); // Refresh after update
//     } catch (err) {
//       console.error('Error updating status', err);
//       Alert.alert('Error', 'Failed to update order status.');
//     }
//   };

//   const renderOrder = ({ item }: { item: Order }) => (
//     <View style={styles.orderContainer}>
//       <Text style={styles.orderTitle}>Order #{item.id}</Text>
//       <Text>Status: {item.status}</Text>
//       <Text>Total: ₹{item.total_amount}</Text>
//       <Text>Address: {item.delivery_address}</Text>
//       <Text>Created: {new Date(item.created_at).toLocaleString()}</Text>

//       {item.status !== 'delivered' && (
//         <Picker
//           selectedValue={item.status}
//           onValueChange={(value) => updateOrderStatus(item.id, value)}
//           style={styles.picker}
//         >
//           <Picker.Item label="Select new status" value={item.status} />
//           <Picker.Item label="Out for Delivery" value="out_for_delivery" />
//           <Picker.Item label="Delivered" value="delivered" />
//           <Picker.Item label="Delivery Failed" value="delivery_failed" />
//         </Picker>
//       )}
//     </View>
//   );

//   const handleLogout = () => {
//     logout();
//     navigation.reset({
//       index: 0,
//       routes: [{ name: 'Login' }],
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Delivery Dashboard</Text>

//       {loading ? (
//         <ActivityIndicator size="large" color="#0984e3" />
//       ) : (
//         <FlatList
//           data={orders}
//           keyExtractor={(order) => order.id.toString()}
//           renderItem={renderOrder}
//           contentContainerStyle={{ paddingBottom: 100 }}
//         />
//       )}

//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutText}>Log Out</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Delivery_Screen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingTop: 40,
//     paddingHorizontal: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#2d3436',
//   },
//   orderContainer: {
//     padding: 14,
//     marginVertical: 10,
//     backgroundColor: '#ffffff',
//     borderRadius: 10,
//     elevation: 3,
//     borderColor: '#dfe6e9',
//     borderWidth: 1,
//   },
//   orderTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 6,
//   },
//   picker: {
//     marginTop: 10,
//     backgroundColor: '#f1f2f6',
//     borderRadius: 8,
//   },
//   logoutButton: {
//     backgroundColor: '#d63031',
//     padding: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   logoutText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });


import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../AuthContext';
import CONFIG from '../../../config';
import { useNavigation } from '@react-navigation/native';

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

const Delivery_Screen = () => {
  const { token, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_URL}/delivery/orders`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      const data = await response.json();
      if (data?.orders) {
        setOrders(data.orders);
      } else {
        Alert.alert('No orders', 'No delivery orders found.');
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
      Alert.alert('Error', 'Unable to fetch delivery orders.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${CONFIG.API_URL}/delivery/orders/${orderId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      Alert.alert(data.message || 'Order status updated');
      fetchOrders(); // Refresh after update
    } catch (err) {
      console.error('Error updating status', err);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order #{item.id}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>
          {item.status.replace(/_/g, ' ')}
        </Text>
      </View>

      <Text style={styles.cardText}>Total: ₹{item.total_amount.toFixed(2)}</Text>
      <Text style={styles.cardText}>Address: {item.delivery_address}</Text>
      <Text style={styles.cardText}>
        Created: {new Date(item.created_at).toLocaleString()}
      </Text>

      {item.status !== 'delivered' && (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={item.status}
            onValueChange={(value) => updateOrderStatus(item.id, value)}
            style={styles.picker}
          >
            <Picker.Item label="Select new status" value={item.status} />
            <Picker.Item label="Out for Delivery" value="out_for_delivery" />
            <Picker.Item label="Delivered" value="delivered" />
            <Picker.Item label="Delivery Failed" value="delivery_failed" />
          </Picker>
        </View>
      )}
    </View>
  );

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return { backgroundColor: '#2ecc71' };
      case 'out_for_delivery':
        return { backgroundColor: '#f39c12' };
      case 'delivery_failed':
        return { backgroundColor: '#e74c3c' };
      default:
        return { backgroundColor: '#95a5a6' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📦 Delivery Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0984e3" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => order.id.toString()}
          renderItem={renderOrder}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Delivery_Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: '#f1f2f6',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2d3436',
    alignSelf: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#ccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0984e3',
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardText: {
    fontSize: 15,
    color: '#2d3436',
    marginBottom: 4,
  },
  pickerWrapper: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f1f2f6',
  },
  picker: {
    height: 44,
    width: '100%',
  },
  logoutButton: {
    backgroundColor: '#d63031',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

