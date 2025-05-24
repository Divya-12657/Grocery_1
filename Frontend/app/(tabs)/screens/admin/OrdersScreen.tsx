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
      console.log("Fetched Orders:", data); // Log the fetched orders
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
          Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Fetched Order Items for Order ID", orderId, ":", data);  // Log the fetched order items
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

    console.log("Rendering Order ID", item.id, "Order Items:", orderItems); // Log order items here

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

        {isExpanded && (
          <>
            {orderItems && orderItems.length > 0 ? (
              <FlatList
                data={orderItems}
                keyExtractor={(orderItem) => orderItem?.id ? orderItem.id.toString() : `default_key_${Math.random()}`}
                renderItem={({ item }) => (
                  <View style={styles.orderItemContainer}>
                    <Text>{item.product_name}</Text>
                    <Text>Quantity: {item.quantity}</Text>
                    <Text>Price: ${item.price}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noItemsText}>No items in this order.</Text>
            )}
          </>
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
  noItemsText: {
    fontStyle: 'italic',
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderScreen;
