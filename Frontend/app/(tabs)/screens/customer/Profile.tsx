import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { AuthContext } from '../../AuthContext';
import axios from 'axios';
import CONFIG from '../../../config';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: 'Groceries',
    memberSince: new Date().toLocaleDateString(),
  });

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_URL}/user/stats/${user?.id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setOrderStats(response.data);
    } catch (error) {
      console.log('Error fetching stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`${CONFIG.API_URL}/user/profile/${user?.id}`, userProfile, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  // const handleLogout = () => {
  //   Alert.alert(
  //     'Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Home') },
  //     ]
  //   );
  // };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout(); // clear user context
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const quickActions = [
    {
      id: 1,
      title: 'My Orders',
      icon: '📦',
      onPress: () => {console.log('navigating to orders');
      navigation.navigate('PastOrder') // No userId needed, token used in backend
    },
   },
    { 
      id: 2,
      title: 'Favorites',
      icon: '❤️',
      onPress: () => navigation.navigate('Favorites'),
    },
    {
      id: 3,
      title: 'Addresses',
      icon: '📍',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 4,
      title: 'Payment Methods',
      icon: '💳',
      onPress: () => navigation.navigate('PaymentMethods'),
    },
  ];

  const supportOptions = [
    {
      id: 1,
      title: 'Help & Support',
      icon: '❓',
      onPress: () => {
        const message = encodeURIComponent('Hi! I need help with my account.');
        const whatsappUrl = `whatsapp://send?phone=+919945277470&text=${message}`;
        Linking.openURL(whatsappUrl).catch(() =>
          Linking.openURL(`https://wa.me/919945277470?text=${message}`)
        );
      },
    },
    {
      id: 2,
      title: 'About Us',
      icon: 'ℹ️',
      onPress: () => navigation.navigate('About'),
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: '🔒',
      onPress: () => navigation.navigate('Privacy'),
    },
    {
      id: 4,
      title: 'Terms of Service',
      icon: '📋',
      onPress: () => navigation.navigate('Terms'),
    },
  ];

  // UI components remain the same as before. You can keep all style and view parts unchanged
  // Your original layout structure is already well designed, so just replace the business logic above.

  return (
    <ScrollView style={styles.container}>
      {/* KEEP ALL UI AS-IS */}
      {/* Just make sure that user?.token exists in context */}
      {/* You already included logout and modal correctly */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Keep your original styles unchanged
});
