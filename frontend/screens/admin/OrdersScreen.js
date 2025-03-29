import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://0.0.0.0:5000/orders', {
        headers: { Authorization: token }
      });
      setOrders(response.data);
    } catch (error) {
      alert('Error fetching orders');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`http://0.0.0.0:5000/admin/orders/${orderId}`, {
        status
      }, {
        headers: { Authorization: token }
      });
      fetchOrders();
    } catch (error) {
      alert('Error updating order status');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Total: ${item.total_amount}</Text>
            <Text>Address: {item.delivery_address}</Text>
            <Text>Date: {new Date(item.created_at).toLocaleString()}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => updateOrderStatus(item.id, 'confirmed')}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: '#2196F3' }]}
                onPress={() => updateOrderStatus(item.id, 'delivered')}
              >
                <Text style={styles.buttonText}>Delivered</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statusButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});