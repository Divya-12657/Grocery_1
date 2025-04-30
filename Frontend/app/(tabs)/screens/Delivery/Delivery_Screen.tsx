import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../AuthContext';
import CONFIG from '../../../config';

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
}

const Delivery_Screen = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${CONFIG.API_URL}/delivery/orders`, {
        headers: { Authorization: `${token}` }
      });
      const data = await response.json();
      if (data?.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
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
          Authorization: `${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      Alert.alert(data.message);
      fetchOrders();
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderTitle}>Order #{item.id}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Total: ${item.total_amount}</Text>
      <Text>Address: {item.delivery_address}</Text>
      <Text>Created: {new Date(item.created_at).toLocaleString()}</Text>

      {item.status !== 'delivered' && (
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
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="blue" />;
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order.id.toString()}
      renderItem={renderOrder}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  orderContainer: {
    padding: 12,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2
  },
  orderTitle: {
    fontWeight: 'bold',
    fontSize: 16
  },
  picker: {
    marginTop: 10,
    backgroundColor: '#f0f0f0'
  }
});

export default Delivery_Screen;
