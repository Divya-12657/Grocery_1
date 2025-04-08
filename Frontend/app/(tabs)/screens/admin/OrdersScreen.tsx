import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.error("No authentication token found");
        setError("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }
      
      console.log("Making API request to fetch orders...");
      const response = await axios.get('http://192.168.0.165:5000/orders', {

        headers: { Authorization: `Bearer ${token}` } // Make sure token format is correct
      });
      
      console.log("API Response:", response.status, response.data);
      
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data && Array.isArray(response.data.orders)) {
        // If API returns data in a nested object like { orders: [...] }
        setOrders(response.data.orders);
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Received unexpected data format from server");
      }
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
      setError(error.response?.data?.message || error.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        alert("Authentication token missing. Please log in again.");
        return;
      }
      
      console.log(`Updating order ${orderId} status to ${status}...`);
      await axios.put(`http://192.168.0.165:5000/admin/orders/${orderId}`, {
        status
      }, {
        // headers: { Authorization: `Bearer ${token}` }
        headers: { Authorization: `Bearer ${token.trim()}` }

      });
      
      alert(`Order #${orderId} status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error.response || error);
      alert(error.response?.data?.message || "Error updating order status");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noOrdersText}>No orders found</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchOrders}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => {
          console.log("Rendering order:", item); // Log each order
          return (
            <View style={styles.orderCard}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <Text>Status: {item.status || "pending"}</Text>
              <Text>Total: ${item.total_amount}</Text>
              <Text>Address: {item.delivery_address}</Text>
              <Text>Date: {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}</Text>
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
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  noOrdersText: {
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: 150,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    width: 150,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});