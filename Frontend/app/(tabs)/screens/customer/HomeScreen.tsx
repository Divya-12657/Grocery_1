import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import CONFIG from '../../../config';
import { AuthContext } from '../../AuthContext';

const screenWidth = Dimensions.get('window').width;
const productItemWidth = (screenWidth - 140) / 2;

export default function HomeScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestedItem, setRequestedItem] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const categoryScrollRef = useRef(null);

  const WHATSAPP_CONFIG = {
    phoneNumber: '+919945277470',
    defaultMessage: 'Hi! I need help with my grocery order.',
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${CONFIG.API_URL}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId
        ? `${CONFIG.API_URL}/products/category/${categoryId}`
        : `${CONFIG.API_URL}/products`;
      const res = await axios.get(url);
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    logout(navigation);
  };

  const handleRequestSubmit = () => {
    if (!requestedItem.trim()) {
      Alert.alert('Please enter the product name');
      return;
    }

    const message = encodeURIComponent(`Hi, I'm looking for "${requestedItem}" which is not available.`);
    const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
    const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace('+', '')}?text=${message}`;

    Linking.openURL(whatsappUrl).catch(() => Linking.openURL(whatsappWebUrl));
    setRequestModalVisible(false);
    setRequestedItem('');
  };

  const goToPastOrders = () => {
    navigation.navigate('PastOrders', { userId: user?.id });
    setShowLogout(false);
  };

  const categoryList = [{ id: null, name: 'All' }, ...categories];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Products</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.whatsappButton} onPress={() => {
            const message = encodeURIComponent(WHATSAPP_CONFIG.defaultMessage);
            const whatsappUrl = `whatsapp://send?phone=${WHATSAPP_CONFIG.phoneNumber}&text=${message}`;
            const whatsappWebUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber.replace('+', '')}?text=${message}`;

            Linking.canOpenURL(whatsappUrl)
              .then((supported) => supported ? Linking.openURL(whatsappUrl) : Linking.openURL(whatsappWebUrl))
              .catch(() => Alert.alert('Error', 'Unable to open WhatsApp.'));
          }}>
            <Text style={styles.whatsappText}>💬 Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.requestButton} onPress={() => setRequestModalVisible(true)}>
            <Text style={styles.requestText}>+ Request Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>

        {showLogout && (
          <View style={styles.profileDropdown}>
            <TouchableOpacity onPress={goToPastOrders} style={styles.profileOption}>
              <Text>Past Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.profileOption}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.stickyHeader}>
          <ScrollView
            ref={categoryScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            style={styles.categoryScroll}
            snapToAlignment="start"
            decelerationRate="fast"
            snapToInterval={100}
          >
            {categoryList.map((item, index) => (
              <TouchableOpacity
                key={item.id ?? 'all'}
                style={[
                  styles.categoryPill,
                  selectedCategory === item.id && styles.categoryPillSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  fetchProducts(item.id);
                  
                  // Enhanced auto-scroll with better positioning
                  const pillWidth = 90;
                  const scrollPosition = Math.max(0, (index * pillWidth) - 50);
                  categoryScrollRef.current?.scrollTo({ 
                    x: scrollPosition, 
                    animated: true 
                  });
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.scrollHint}>
              <Text style={styles.scrollHintText}>→</Text>
            </View>
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {products.map((item) => {
            const quantityInCart = cart.filter((p) => p.id === item.id).length;

            return (
              <View key={item.id} style={[styles.productItem, { width: productItemWidth }]}>
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>Image</Text>
                </View>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>₹{item.price?.toFixed(2)}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => {
                      const index = cart.findIndex((p) => p.id === item.id);
                      if (index !== -1) {
                        const updatedCart = [...cart];
                        updatedCart.splice(index, 1);
                        setCart(updatedCart);
                      }
                    }}
                    disabled={quantityInCart === 0}
                  >
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityDisplay}>{quantityInCart}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setCart([...cart, item])}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingCartButton}
        onPress={() => navigation.navigate('Cart', { cart })}
      >
        <Text style={styles.cartText}>🛒 {cart.length}</Text>
      </TouchableOpacity>

      <Modal visible={requestModalVisible} animationType="slide" transparent onRequestClose={() => setRequestModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request an Item</Text>
            <TextInput
              placeholder="Enter item name"
              value={requestedItem}
              onChangeText={setRequestedItem}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleRequestSubmit}>
                <Text style={styles.modalButtonText}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setRequestModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#000' }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: 10,
    gap: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  whatsappText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestButton: {
    backgroundColor: '#00b894',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  requestText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileDropdown: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    elevation: 3,
    marginHorizontal: 20,
    marginTop: 10,
  },
  profileOption: {
    paddingVertical: 8,
  },
  stickyHeader: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryScroll: {
    maxHeight: 50,
    flexGrow: 0,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillSelected: {
    backgroundColor: '#00b894',
    elevation: 4,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollHint: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 20,
  },
  scrollHintText: {
    fontSize: 20,
    color: '#888',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    padding: 10,
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 14,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  quantityButton: {
    backgroundColor: '#00b894',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
  },
  quantityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityDisplay: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
    zIndex: 100,
  },
  cartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '85%',
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#00b894',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});





