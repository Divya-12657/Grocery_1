

// import React, { useState, useContext, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Modal,
//   Alert,
//   Switch,
//   Linking,
// } from 'react-native';
// import { AuthContext } from '../../AuthContext';
// import axios from 'axios';
// import CONFIG from '../../../config';

// export default function ProfileScreen({ navigation }) {
//   // Updated to use your AuthContext structure
//   const { token, role, logout } = useContext(AuthContext);

//   const [editModalVisible, setEditModalVisible] = useState(false);
//   const [notifications, setNotifications] = useState(true);
//   const [darkMode, setDarkMode] = useState(false);

//   const [userProfile, setUserProfile] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//   });

//   const [orderStats, setOrderStats] = useState({
//     totalOrders: 0,
//     totalSpent: 0,
//     favoriteCategory: 'Groceries',
//     memberSince: new Date().toLocaleDateString(),
//   });

//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [loadingStats, setLoadingStats] = useState(false);
//   const [savingProfile, setSavingProfile] = useState(false);

//   // Fixed authHeader function for your AuthContext structure
//   const authHeader = () => {
//     console.log('[ProfileScreen] Token from context:', token ? `${token.substring(0, 20)}...` : 'null');
//     console.log('[ProfileScreen] Role from context:', role);
    
//     if (!token) {
//       console.log('[ProfileScreen] No token available!');
//       return { 'Content-Type': 'application/json' };
//     }
    
//     // Remove "Bearer " if it's already in the token (fix for double Bearer issue)
//     let cleanToken = token;
//     if (token.startsWith('Bearer ')) {
//       cleanToken = token.substring(7); // Remove "Bearer " prefix
//       console.log('[ProfileScreen] Removed Bearer prefix from stored token');
//     }
    
//     const headers = { 
//       Authorization: `Bearer ${cleanToken}`,
//       'Content-Type': 'application/json' 
//     };
    
//     console.log('[ProfileScreen] Headers being sent:', {
//       ...headers,
//       Authorization: `Bearer ${cleanToken.substring(0, 20)}...`
//     });
    
//     return headers;
//   };

//   // Fetch profile + stats when token is available
//   useEffect(() => {
//     if (!token) {
//       console.log('[ProfileScreen] Waiting for token...');
//       return;
//     }
//     console.log('[ProfileScreen] Token available, fetching data...');
//     fetchUserProfile();
//     fetchOrderStats();
//   }, [token]);

//   // GET /user/profile
//   const fetchUserProfile = async () => {
//     if (!token) {
//       console.log('[ProfileScreen] No token, skipping profile fetch');
//       return;
//     }

//     setLoadingProfile(true);
//     try {
//       console.log('[ProfileScreen] Fetching profile...');
//       console.log('[ProfileScreen] API URL:', `${CONFIG.API_URL}/user/profile`);

//       const res = await axios.get(`${CONFIG.API_URL}/user/profile`, {
//         headers: authHeader(),
//       });
      
//       console.log('[ProfileScreen] Profile fetch response:', res.data);
//       const data = res.data || {};

//       setUserProfile({
//         name: data.name || '',
//         email: data.email || '',
//         phone: data.phone || '',
//         address: data.address || '',
//       });

//       if (data.created_at) {
//         setOrderStats((s) => ({
//           ...s,
//           memberSince: tryFormatDate(data.created_at),
//         }));
//       }
//     } catch (err) {
//       console.log('[ProfileScreen] fetchUserProfile error:', err);
//       console.log('[ProfileScreen] Error response:', err?.response?.data);
//       console.log('[ProfileScreen] Error status:', err?.response?.status);
      
//       if (err?.response?.status === 401) {
//         Alert.alert(
//           'Authentication Error', 
//           'Your session has expired. Please log in again.',
//           [
//             {
//               text: 'OK',
//               onPress: () => {
//                 logout(navigation);
//               }
//             }
//           ]
//         );
//       } else {
//         Alert.alert('Error', 'Failed to load profile data');
//       }
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   // GET /user/stats - Modified since we don't have user.id from context
//   const fetchOrderStats = async () => {
//     if (!token) return;
    
//     setLoadingStats(true);
//     try {
//       // We'll need to get the user ID from the profile first, or modify this endpoint
//       // For now, let's try to get stats without user ID - you might need to modify backend
//       console.log('[ProfileScreen] Fetching user stats...');
      
//       // Try to get user stats - you may need to modify your backend to get user ID from token
//       const res = await axios.get(`${CONFIG.API_URL}/user/stats`, {
//         headers: authHeader(),
//       });
      
//       const data = res.data || {};
//       console.log('[ProfileScreen] Stats response:', data);

//       setOrderStats((s) => ({
//         totalOrders: data.totalOrders ?? s.totalOrders,
//         totalSpent: data.totalSpent ?? s.totalSpent,
//         favoriteCategory: data.favoriteCategory ?? s.favoriteCategory,
//         memberSince: data.memberSince ?? s.memberSince,
//       }));
//     } catch (err) {
//       console.log('[ProfileScreen] fetchOrderStats error:', err?.response?.data || err?.message);
//       // Don't show alert for stats error, it's not critical
//     } finally {
//       setLoadingStats(false);
//     }
//   };

//   // Handle edit button click
//   const handleEditButtonClick = async () => {
//     console.log('[ProfileScreen] Edit button clicked');
//     await fetchUserProfile();
//     setEditModalVisible(true);
//   };

//   // PUT /user/profile
//   const handleSaveProfile = async () => {
//     try {
//       console.log('[ProfileScreen] Saving profile with data:', userProfile);
      
//       // Validate required fields
//       if (!userProfile.name?.trim()) {
//         Alert.alert('Error', 'Name is required');
//         return;
//       }
      
//       if (!userProfile.email?.trim()) {
//         Alert.alert('Error', 'Email is required');
//         return;
//       }

//       // Basic email validation
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(userProfile.email.trim())) {
//         Alert.alert('Error', 'Please enter a valid email address');
//         return;
//       }

//       setSavingProfile(true);

//       const payload = {
//         name: userProfile.name.trim(),
//         email: userProfile.email.trim().toLowerCase(),
//         phone: userProfile.phone?.trim() || '',
//         address: userProfile.address?.trim() || '',
//       };

//       console.log('[ProfileScreen] Sending PUT request with payload:', payload);

//       const response = await axios.put(`${CONFIG.API_URL}/user/profile`, payload, {
//         headers: authHeader(),
//       });

//       console.log('[ProfileScreen] PUT response:', response.data);

//       setEditModalVisible(false);
//       Alert.alert('Success', 'Profile updated successfully!');

//       // Refresh profile data after successful save
//       await fetchUserProfile();
//       await fetchOrderStats();

//     } catch (err) {
//       console.log('[ProfileScreen] handleSaveProfile error:', err);
//       console.log('[ProfileScreen] Error response:', err?.response?.data);
//       console.log('[ProfileScreen] Error status:', err?.response?.status);
      
//       if (err?.response?.status === 401) {
//         Alert.alert(
//           'Authentication Error', 
//           'Your session has expired. Please log in again.',
//           [
//             {
//               text: 'OK',
//               onPress: () => logout(navigation)
//             }
//           ]
//         );
//       } else {
//         const errorMessage = err?.response?.data?.message || 
//                             err?.response?.data?.error || 
//                             err?.message || 
//                             'Failed to update profile';
//         Alert.alert('Error', errorMessage);
//       }
//     } finally {
//       setSavingProfile(false);
//     }
//   };

//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: () => {
//           logout();
//           navigation.reset({
//             index: 0,
//             routes: [{ name: 'Login' }],
//           });
//         },
//       },
//     ]);
//   };

//   const quickActions = [
//     {
//       id: 1,
//       title: 'My Orders',
//       icon: '📦',
//       onPress: () => navigation.navigate('PastOrder'),
//     },
//     {
//       id: 2,
//       title: 'Favorites',
//       icon: '❤️',
//       onPress: () => navigation.navigate('Favorites'),
//     },
//     {
//       id: 3,
//       title: 'Addresses',
//       icon: '📍',
//       onPress: () => navigation.navigate('Addresses'),
//     },
//     {
//       id: 4,
//       title: 'Payment Methods',
//       icon: '💳',
//       onPress: () => navigation.navigate('PaymentMethods'),
//     },
//   ];

//   const supportOptions = [
//     {
//       id: 1,
//       title: 'Help & Support',
//       icon: '❓',
//       onPress: () => {
//         const message = encodeURIComponent('Hi! I need help with my account.');
//         const whatsappUrl = `whatsapp://send?phone=+919945277470&text=${message}`;
//         Linking.openURL(whatsappUrl).catch(() =>
//           Linking.openURL(`https://wa.me/919945277470?text=${message}`)
//         );
//       },
//     },
//     {
//       id: 2,
//       title: 'About Us',
//       icon: 'ℹ️',
//       onPress: () => navigation.navigate('About'),
//     },
//     {
//       id: 3,
//       title: 'Privacy Policy',
//       icon: '🔒',
//       onPress: () => navigation.navigate('Privacy'),
//     },
//     {
//       id: 4,
//       title: 'Terms of Service',
//       icon: '📋',
//       onPress: () => navigation.navigate('Terms'),
//     },
//   ];

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Profile</Text>
//         <TouchableOpacity 
//           style={[styles.editButton, loadingProfile && styles.disabledButton]} 
//           onPress={handleEditButtonClick}
//           disabled={loadingProfile}
//         >
//           <Text style={styles.editButtonText}>
//             {loadingProfile ? 'Loading...' : 'Edit'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Profile Info */}
//       <View style={styles.profileSection}>
//         <View style={styles.profileImageContainer}>
//           <View style={styles.profileImage}>
//             <Text style={styles.profileImageText}>
//               {(userProfile?.name?.charAt?.(0) || '?').toUpperCase()}
//             </Text>
//           </View>
//           <View style={styles.statusBadge}>
//             <Text style={styles.statusText}>
//               {role === 'Admin' ? 'Admin' : 'Premium'}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.profileInfo}>
//           <Text style={styles.userName}>{userProfile.name || 'N/A'}</Text>
//           <Text style={styles.userEmail}>{userProfile.email || 'N/A'}</Text>
//           <Text style={styles.userPhone}>{userProfile.phone || 'No phone number'}</Text>
//           <Text style={styles.memberSince}>Member since {orderStats.memberSince}</Text>
//         </View>
//       </View>

//       {/* Stats Cards */}
//       <View style={styles.statsSection}>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>
//             {loadingStats ? '...' : orderStats.totalOrders}
//           </Text>
//           <Text style={styles.statLabel}>Total Orders</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>
//             {loadingStats ? '...' : `₹${orderStats.totalSpent}`}
//           </Text>
//           <Text style={styles.statLabel}>Total Spent</Text>
//         </View>
//         <View style={styles.statCard}>
//           <Text style={styles.statNumber}>
//             {loadingStats ? '...' : orderStats.favoriteCategory}
//           </Text>
//           <Text style={styles.statLabel}>Favorite Category</Text>
//         </View>
//       </View>

//       {/* Quick Actions */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Quick Actions</Text>
//         <View style={styles.actionGrid}>
//           {quickActions.map((action) => (
//             <TouchableOpacity key={action.id} style={styles.actionCard} onPress={action.onPress}>
//               <Text style={styles.actionIcon}>{action.icon}</Text>
//               <Text style={styles.actionTitle}>{action.title}</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Settings */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Settings</Text>
//         <View style={styles.settingsContainer}>
//           <View style={styles.settingItem}>
//             <Text style={styles.settingLabel}>Push Notifications</Text>
//             <Switch
//               value={notifications}
//               onValueChange={setNotifications}
//               trackColor={{ false: '#767577', true: '#00b894' }}
//               thumbColor={notifications ? '#fff' : '#f4f3f4'}
//             />
//           </View>

//           <View style={styles.settingItem}>
//             <Text style={styles.settingLabel}>Dark Mode</Text>
//             <Switch
//               value={darkMode}
//               onValueChange={setDarkMode}
//               trackColor={{ false: '#767577', true: '#00b894' }}
//               thumbColor={darkMode ? '#fff' : '#f4f3f4'}
//             />
//           </View>
//         </View>
//       </View>

//       {/* Support */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Support</Text>
//         <View style={styles.supportContainer}>
//           {supportOptions.map((option) => (
//             <TouchableOpacity key={option.id} style={styles.supportItem} onPress={option.onPress}>
//               <Text style={styles.supportIcon}>{option.icon}</Text>
//               <Text style={styles.supportTitle}>{option.title}</Text>
//               <Text style={styles.supportArrow}>→</Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       {/* Logout Button */}
//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>

//       {/* Edit Profile Modal */}
//       <Modal 
//         visible={editModalVisible} 
//         animationType="slide" 
//         transparent 
//         onRequestClose={() => setEditModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Edit Profile</Text>

//             <ScrollView style={styles.modalForm}>
//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Name *</Text>
//                 <TextInput 
//                   style={[
//                     styles.input, 
//                     !userProfile.name?.trim() && styles.inputError
//                   ]} 
//                   value={userProfile.name} 
//                   onChangeText={(text) => setUserProfile({ ...userProfile, name: text })} 
//                   placeholder="Enter your name" 
//                   editable={!savingProfile}
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Email *</Text>
//                 <TextInput 
//                   style={[
//                     styles.input, 
//                     !userProfile.email?.trim() && styles.inputError
//                   ]} 
//                   value={userProfile.email} 
//                   onChangeText={(text) => setUserProfile({ ...userProfile, email: text })} 
//                   placeholder="Enter your email" 
//                   keyboardType="email-address" 
//                   autoCapitalize="none"
//                   editable={!savingProfile}
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Phone</Text>
//                 <TextInput 
//                   style={styles.input} 
//                   value={userProfile.phone} 
//                   onChangeText={(text) => setUserProfile({ ...userProfile, phone: text })} 
//                   placeholder="Enter your phone number" 
//                   keyboardType="phone-pad" 
//                   editable={!savingProfile}
//                 />
//               </View>

//               <View style={styles.inputGroup}>
//                 <Text style={styles.inputLabel}>Address</Text>
//                 <TextInput 
//                   style={[styles.input, styles.textArea]} 
//                   value={userProfile.address} 
//                   onChangeText={(text) => setUserProfile({ ...userProfile, address: text })} 
//                   placeholder="Enter your address" 
//                   multiline 
//                   numberOfLines={3} 
//                   editable={!savingProfile}
//                 />
//               </View>

//               <Text style={styles.requiredFieldsNote}>* Required fields</Text>
//             </ScrollView>

//             <View style={styles.modalButtons}>
//               <TouchableOpacity 
//                 style={[styles.modalButton, styles.cancelButton]} 
//                 onPress={() => setEditModalVisible(false)}
//                 disabled={savingProfile}
//               >
//                 <Text style={styles.cancelButtonText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[
//                   styles.modalButton, 
//                   styles.saveButton, 
//                   savingProfile && styles.disabledButton
//                 ]} 
//                 onPress={handleSaveProfile}
//                 disabled={savingProfile}
//               >
//                 <Text style={styles.saveButtonText}>
//                   {savingProfile ? 'Saving...' : 'Save Changes'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </ScrollView>
//   );
// }

// const tryFormatDate = (isoOrDateString) => {
//   try {
//     const d = new Date(isoOrDateString);
//     if (isNaN(d.getTime())) return isoOrDateString;
//     return d.toLocaleDateString();
//   } catch {
//     return isoOrDateString;
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   backButton: {
//     padding: 8,
//   },
//   backButtonText: {
//     fontSize: 24,
//     color: '#333',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   editButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#00b894',
//     borderRadius: 15,
//   },
//   editButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   profileSection: {
//     backgroundColor: '#fff',
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   profileImageContainer: {
//     position: 'relative',
//     marginBottom: 15,
//   },
//   profileImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#00b894',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   profileImageText: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   statusBadge: {
//     position: 'absolute',
//     bottom: 0,
//     right: 0,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   statusText: {
//     fontSize: 10,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   profileInfo: {
//     alignItems: 'center',
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   userEmail: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 3,
//   },
//   userPhone: {
//     fontSize: 16,
//     color: '#666',
//     marginBottom: 3,
//   },
//   memberSince: {
//     fontSize: 14,
//     color: '#999',
//   },
//   statsSection: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     backgroundColor: '#fff',
//     padding: 20,
//     marginBottom: 15,
//   },
//   statCard: {
//     alignItems: 'center',
//     flex: 1,
//   },
//   statNumber: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#00b894',
//     marginBottom: 5,
//   },
//   statLabel: {
//     fontSize: 12,
//     color: '#666',
//     textAlign: 'center',
//   },
//   section: {
//     backgroundColor: '#fff',
//     padding: 20,
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//   },
//   actionGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   actionCard: {
//     width: '48%',
//     backgroundColor: '#f8f9fa',
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   actionIcon: {
//     fontSize: 24,
//     marginBottom: 8,
//   },
//   actionTitle: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//     textAlign: 'center',
//   },
//   settingsContainer: {
//     gap: 15,
//   },
//   settingItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   settingLabel: {
//     fontSize: 16,
//     color: '#333',
//   },
//   supportContainer: {
//     gap: 10,
//   },
//   supportItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   supportIcon: {
//     fontSize: 20,
//     marginRight: 15,
//   },
//   supportTitle: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333',
//   },
//   supportArrow: {
//     fontSize: 16,
//     color: '#999',
//   },
//   logoutButton: {
//     backgroundColor: '#e74c3c',
//     margin: 20,
//     padding: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
//   logoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     width: '90%',
//     maxHeight: '80%',
//     borderRadius: 15,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#333',
//   },
//   modalForm: {
//     maxHeight: 400,
//   },
//   inputGroup: {
//     marginBottom: 15,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//     marginBottom: 5,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   inputError: {
//     borderColor: '#e74c3c',
//     borderWidth: 2,
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//   },
//   requiredFieldsNote: {
//     fontSize: 12,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 10,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   cancelButton: {
//     backgroundColor: '#f8f9fa',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   saveButton: {
//     backgroundColor: '#00b894',
//   },
//   cancelButtonText: {
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
// });


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
  // Updated to use your AuthContext structure
  const { token, role, logout } = useContext(AuthContext);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: 'Groceries',
    memberSince: new Date().toLocaleDateString(),
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fixed authHeader function for your AuthContext structure
  const authHeader = () => {
    console.log('[ProfileScreen] Token from context:', token ? `${token.substring(0, 20)}...` : 'null');
    console.log('[ProfileScreen] Role from context:', role);
    
    if (!token) {
      console.log('[ProfileScreen] No token available!');
      return { 'Content-Type': 'application/json' };
    }
    
    // Remove "Bearer " if it's already in the token (fix for double Bearer issue)
    let cleanToken = token;
    if (token.startsWith('Bearer ')) {
      cleanToken = token.substring(7); // Remove "Bearer " prefix
      console.log('[ProfileScreen] Removed Bearer prefix from stored token');
    }
    
    const headers = { 
      Authorization: `Bearer ${cleanToken}`,
      'Content-Type': 'application/json' 
    };
    
    console.log('[ProfileScreen] Headers being sent:', {
      ...headers,
      Authorization: `Bearer ${cleanToken.substring(0, 20)}...`
    });
    
    return headers;
  };

  // Fetch profile + stats when token is available
  useEffect(() => {
    if (!token) {
      console.log('[ProfileScreen] Waiting for token...');
      return;
    }
    console.log('[ProfileScreen] Token available, fetching data...');
    fetchUserProfile();
    fetchOrderStats();
  }, [token]);

  // GET /user/profile
  const fetchUserProfile = async () => {
    if (!token) {
      console.log('[ProfileScreen] No token, skipping profile fetch');
      return;
    }

    setLoadingProfile(true);
    try {
      console.log('[ProfileScreen] Fetching profile...');
      console.log('[ProfileScreen] API URL:', `${CONFIG.API_URL}/user/profile`);

      const res = await axios.get(`${CONFIG.API_URL}/user/profile`, {
        headers: authHeader(),
      });
      
      console.log('[ProfileScreen] Profile fetch response:', res.data);
      const data = res.data || {};

      setUserProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      });

      if (data.created_at) {
        setOrderStats((s) => ({
          ...s,
          memberSince: tryFormatDate(data.created_at),
        }));
      }
    } catch (err) {
      console.log('[ProfileScreen] fetchUserProfile error:', err);
      console.log('[ProfileScreen] Error response:', err?.response?.data);
      console.log('[ProfileScreen] Error status:', err?.response?.status);
      
      if (err?.response?.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => {
                logout(navigation);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  // GET /user/stats - Modified since we don't have user.id from context
  const fetchOrderStats = async () => {
    if (!token) return;
    
    setLoadingStats(true);
    try {
      // We'll need to get the user ID from the profile first, or modify this endpoint
      // For now, let's try to get stats without user ID - you might need to modify backend
      console.log('[ProfileScreen] Fetching user stats...');
      
      // Try to get user stats - you may need to modify your backend to get user ID from token
      const res = await axios.get(`${CONFIG.API_URL}/user/stats`, {
        headers: authHeader(),
      });
      
      const data = res.data || {};
      console.log('[ProfileScreen] Stats response:', data);

      setOrderStats((s) => ({
        totalOrders: data.totalOrders ?? s.totalOrders,
        totalSpent: data.totalSpent ?? s.totalSpent,
        favoriteCategory: data.favoriteCategory ?? s.favoriteCategory,
        memberSince: data.memberSince ?? s.memberSince,
      }));
    } catch (err) {
      console.log('[ProfileScreen] fetchOrderStats error:', err?.response?.data || err?.message);
      // Don't show alert for stats error, it's not critical
    } finally {
      setLoadingStats(false);
    }
  };

  // Handle edit button click
  const handleEditButtonClick = async () => {
    console.log('[ProfileScreen] Edit button clicked');
    await fetchUserProfile();
    setEditModalVisible(true);
  };

  // PUT /user/profile
  const handleSaveProfile = async () => {
    try {
      console.log('[ProfileScreen] Saving profile with data:', userProfile);
      
      // Validate required fields
      if (!userProfile.name?.trim()) {
        Alert.alert('Error', 'Name is required');
        return;
      }
      
      if (!userProfile.email?.trim()) {
        Alert.alert('Error', 'Email is required');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userProfile.email.trim())) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      setSavingProfile(true);

      const payload = {
        name: userProfile.name.trim(),
        email: userProfile.email.trim().toLowerCase(),
        phone: userProfile.phone?.trim() || '',
        address: userProfile.address?.trim() || '',
      };

      console.log('[ProfileScreen] Sending PUT request with payload:', payload);

      const response = await axios.put(`${CONFIG.API_URL}/user/profile`, payload, {
        headers: authHeader(),
      });

      console.log('[ProfileScreen] PUT response:', response.data);

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');

      // Refresh profile data after successful save
      await fetchUserProfile();
      await fetchOrderStats();

    } catch (err) {
      console.log('[ProfileScreen] handleSaveProfile error:', err);
      console.log('[ProfileScreen] Error response:', err?.response?.data);
      console.log('[ProfileScreen] Error status:', err?.response?.status);
      
      if (err?.response?.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [
            {
              text: 'OK',
              onPress: () => logout(navigation)
            }
          ]
        );
      } else {
        const errorMessage = err?.response?.data?.message || 
                            err?.response?.data?.error || 
                            err?.message || 
                            'Failed to update profile';
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // Simplified logout function - just navigate to login screen
  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const quickActions = [
    {
      id: 1,
      title: 'My Orders',
      icon: '📦',
      onPress: () => navigation.navigate('PastOrder'),
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={[styles.editButton, loadingProfile && styles.disabledButton]} 
          onPress={handleEditButtonClick}
          disabled={loadingProfile}
        >
          <Text style={styles.editButtonText}>
            {loadingProfile ? 'Loading...' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage}>
            <Text style={styles.profileImageText}>
              {(userProfile?.name?.charAt?.(0) || '?').toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {role === 'Admin' ? 'Admin' : 'Premium'}
            </Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userProfile.name || 'N/A'}</Text>
          <Text style={styles.userEmail}>{userProfile.email || 'N/A'}</Text>
          <Text style={styles.userPhone}>{userProfile.phone || 'No phone number'}</Text>
          <Text style={styles.memberSince}>Member since {orderStats.memberSince}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {loadingStats ? '...' : orderStats.totalOrders}
          </Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {loadingStats ? '...' : `₹${orderStats.totalSpent}`}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {loadingStats ? '...' : orderStats.favoriteCategory}
          </Text>
          <Text style={styles.statLabel}>Favorite Category</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionCard} onPress={action.onPress}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#00b894' }}
              thumbColor={notifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#00b894' }}
              thumbColor={darkMode ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.supportContainer}>
          {supportOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.supportItem} onPress={option.onPress}>
              <Text style={styles.supportIcon}>{option.icon}</Text>
              <Text style={styles.supportTitle}>{option.title}</Text>
              <Text style={styles.supportArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal 
        visible={editModalVisible} 
        animationType="slide" 
        transparent 
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput 
                  style={[
                    styles.input, 
                    !userProfile.name?.trim() && styles.inputError
                  ]} 
                  value={userProfile.name} 
                  onChangeText={(text) => setUserProfile({ ...userProfile, name: text })} 
                  placeholder="Enter your name" 
                  editable={!savingProfile}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput 
                  style={[
                    styles.input, 
                    !userProfile.email?.trim() && styles.inputError
                  ]} 
                  value={userProfile.email} 
                  onChangeText={(text) => setUserProfile({ ...userProfile, email: text })} 
                  placeholder="Enter your email" 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  editable={!savingProfile}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput 
                  style={styles.input} 
                  value={userProfile.phone} 
                  onChangeText={(text) => setUserProfile({ ...userProfile, phone: text })} 
                  placeholder="Enter your phone number" 
                  keyboardType="phone-pad" 
                  editable={!savingProfile}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={userProfile.address} 
                  onChangeText={(text) => setUserProfile({ ...userProfile, address: text })} 
                  placeholder="Enter your address" 
                  multiline 
                  numberOfLines={3} 
                  editable={!savingProfile}
                />
              </View>

              <Text style={styles.requiredFieldsNote}>* Required fields</Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditModalVisible(false)}
                disabled={savingProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.saveButton, 
                  savingProfile && styles.disabledButton
                ]} 
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                <Text style={styles.saveButtonText}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const tryFormatDate = (isoOrDateString) => {
  try {
    const d = new Date(isoOrDateString);
    if (isNaN(d.getTime())) return isoOrDateString;
    return d.toLocaleDateString();
  } catch {
    return isoOrDateString;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00b894',
    borderRadius: 15,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00b894',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 16,
    color: '#666',
    marginBottom: 3,
  },
  memberSince: {
    fontSize: 14,
    color: '#999',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00b894',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  settingsContainer: {
    gap: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  supportContainer: {
    gap: 10,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  supportIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  supportTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  supportArrow: {
    fontSize: 16,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  requiredFieldsNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#00b894',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});