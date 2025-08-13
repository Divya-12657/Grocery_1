import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';

export default function PastOrderScreen() {
  const { user, token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${CONFIG.API_URL}/orders`, {
        headers: {
          Authorization: `${token}`,
        },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>
        Order ID: <Text style={styles.value}>{item.id}</Text>
      </Text>
      <Text style={styles.label}>
        Status: <Text style={styles.value}>{item.status}</Text>
      </Text>
      <Text style={styles.label}>
        Total: ₹<Text style={styles.value}>{item.total_amount}</Text>
      </Text>
      <Text style={styles.label}>
        Placed On:{' '}
        <Text style={styles.value}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </Text>
      <Text style={styles.label}>
        Address: <Text style={styles.value}>{item.delivery_address}</Text>
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00b894" />
        <Text>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      contentContainerStyle={orders.length === 0 ? styles.centered : styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#00b894']}
        />
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No orders found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontWeight: 'normal',
    color: '#555',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});
