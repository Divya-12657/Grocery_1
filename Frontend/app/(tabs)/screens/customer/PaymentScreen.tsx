
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { AuthContext } from '../../AuthContext';
import CONFIG from '../../../config';

const PaymentScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = route.params?.order_id;

  const upiDetails = {
    payee_vpa: '9945277470@ibl',
    payee_name: 'divya',
  };

  const upiApps = [
    { name: 'PhonePe', package: 'com.phonepe.app' },
    { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user' },
    { name: 'Razorpay' }
  ];

  useEffect(() => {
    if (orderId) fetchSpecificOrder(orderId);
    else fetchPendingOrders();
  }, [token, orderId]);

  const fetchSpecificOrder = async (id) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/orders`, {
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok) {
        const order = data.orders.find(o => o.id === id);
        if (order) setPendingOrder(order);
        else Alert.alert('Error', 'Order not found');
      } else {
        Alert.alert('Error', data.message || 'Failed to load orders');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not fetch order');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/orders`, {
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok) {
        const order = data.orders.find(o => o.status === 'pending');
        setPendingOrder(order || null);
      } else {
        Alert.alert('Error', data.message || 'Failed to load orders');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (order, app) => {
    if (!token) {
      Alert.alert('Error', 'Login required');
      return;
    }

    if (app.name === 'Razorpay') {
      handleRazorpay(order);
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
          app_package: app.package,
        }),
      });

      const result = await res.json();

      if (res.ok && result.upi_link) {
        Linking.openURL(result.upi_link).catch(() => {
          Alert.alert('Error', `${app.name} is not installed or failed to open`);
        });

        setTimeout(() => {
          Alert.alert('Payment Status', 'Did you complete the payment?', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => confirmUPIPayment(order.id) },
          ]);
        }, 5000);
      } else {
        Alert.alert('Error', result.message || 'Payment failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Payment request failed');
    }
  };

  const handleRazorpay = async (order) => {
    try {
        setLoading(true);
        const res = await fetch(`${CONFIG.API_URL}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({
                order_id: order.id,
                payment_method: 'razorpay',
            }),
        });

        const result = await res.json();

        if (res.ok && result.razorpay_order_id) {
            const options = {
                description: 'Grocery Order Payment',
                currency: result.currency,
                key: result.razorpay_key,
                amount: result.amount,
                name: 'Grocery Store',
                order_id: result.razorpay_order_id,
                prefill: {
                    email: 'customer@example.com',
                    contact: '9999999999',
                    name: 'Customer',
                },
                theme: { color: '#673AB7' },
            };

            RazorpayCheckout.open(options)
                .then(response => {
                    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
                    confirmRazorpayPayment(order.id, razorpay_order_id, razorpay_payment_id, razorpay_signature);
                })
                .catch(error => {
                    console.error('Razorpay error:', error);
                    Alert.alert('Payment Failed', 'Payment was cancelled or failed. Please try again.');
                });
        } else {
            Alert.alert('Error', result.message || 'Failed to create Razorpay order');
        }
    } catch (err) {
        console.error('Razorpay integration error:', err);
        Alert.alert('Error', 'Failed to initiate payment. Please check your connection.');
    } finally {
        setLoading(false);
    }
};

  const confirmUPIPayment = async (orderId) => {
    try {
      const res = await fetch(`${CONFIG.API_URL}/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ order_id: orderId }),
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Payment confirmed!', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to confirm payment');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not confirm payment');
    }
  };

  const confirmRazorpayPayment = async (orderId, razorpay_order_id, payment_id, signature) => {
    try {
        setLoading(true);
        const res = await fetch(`${CONFIG.API_URL}/payment/razorpay/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({
                order_id: orderId,
                razorpay_order_id,
                payment_id,
                signature,
            }),
        });

        const result = await res.json();

        if (res.ok) {
            Alert.alert('Success', 'Payment confirmed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
        } else {
            Alert.alert('Error', result.error || result.message || 'Failed to confirm payment');
        }
    } catch (err) {
        console.error('Razorpay confirmation error:', err);
        Alert.alert('Error', 'Could not confirm payment. Please contact support.');
    } finally {
        setLoading(false);
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
  container: { padding: 16, flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
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
  orderText: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  detailText: { fontSize: 16, marginBottom: 6 },
  amountText: { fontSize: 20, fontWeight: '700', color: '#673AB7', marginVertical: 10 },
  addressText: { fontSize: 16, marginBottom: 20, fontStyle: 'italic' },
  payMethodText: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
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
  appButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  emptyText: { fontSize: 18, marginBottom: 24, textAlign: 'center' },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  refreshButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

