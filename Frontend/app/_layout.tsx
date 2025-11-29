
// // import React from 'react';
// import React, { useContext } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// // import LoginScreen from './(tabs)/screens/LoginScreen';
// // import HomeScreen from './(tabs)/screens/customer/HomeScreen';
// // import CartScreen from './(tabs)/screens/customer/CartScreen';
// // import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
// // import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
// // import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';

// import LoginScreen from './(tabs)/screens/LoginScreen';
// import HomeScreen from './(tabs)/screens/customer/HomeScreen';
// import CartScreen from './(tabs)/screens/customer/CartScreen';
// import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
// import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
// import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';
// import PaymentScreen from './(tabs)/screens/customer/PaymentScreen';
// import { AuthProvider } from './(tabs)/AuthContext';

// import RegisterScreen from './(tabs)/screens/RegisterScreen'; // Import the RegisterScreen
// // import LoginScreen from './(tabs)/screens/LoginScreen'; // Import LoginScreen
// import HomeScreen1 from './(tabs)/screens/Homescreen1';
// import Delivery_Screen from './(tabs)/screens/Delivery/Delivery_Screen';



// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <AuthProvider>
//       <Stack.Navigator initialRouteName="Home">

//       <Stack.Screen 
//           name="Home" 
//           component={HomeScreen1} 
//           options={{ headerShown: false }}
//         />

//         <Stack.Screen 
//           name="Register" 
//           component={RegisterScreen} 
//           options={{ headerShown: false }}
//           options={{ title: 'Home' }}
//         />

 
//         <Stack.Screen 
//           name="Login" 
//           component={LoginScreen} 
//           options={{ headerShown: false }}
//           options={{ title: 'Home' }}

//         />
//         <Stack.Screen 
//           name="CustomerHome" 
//           component={HomeScreen} 
//           options={{ title: 'Home' }}
//         />
//         <Stack.Screen 
//           name="Cart" 
//           component={CartScreen} 
//           options={{ title: 'Shopping Cart' }}
//         />
//         <Stack.Screen 
//           name="AdminHome" 
//           component={AdminHomeScreen} 
//           options={{ title: 'Admin Dashboard' }}
//         />
//         <Stack.Screen 
//           name="Products" 
//           component={ProductsScreen} 
//           options={{ title: 'Manage Products' }}
//         />
//         <Stack.Screen 
//           name="AdminOrders" 
//           component={OrdersScreen} 
//           options={{ title: 'Manage Orders' }}
//         />

//           <Stack.Screen 
//             name="Payment" 
//             component={PaymentScreen} 
//             options={{ title: 'Payment' }}
//           />

//           <Stack.Screen 
//             name="Delivery" 
//             component={Delivery_Screen} 
//             options={{ title: 'Delivery Screen' }}
//           />
//           {/* <Stack.Screen 
//             name="OrderConfirmation" 
//             component={OrderConfirmation} 
//             options={{ headerShown: false }}
//           />  */}


//       </Stack.Navigator>
//       </AuthProvider>
    
//   );
// }

// import React, { useContext } from 'react';
// // import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { View, ActivityIndicator } from 'react-native';

// import LoginScreen from './(tabs)/screens/LoginScreen';
// import RegisterScreen from './(tabs)/screens/RegisterScreen';
// import HomeScreen1 from './(tabs)/screens/Homescreen1';

// import HomeScreen from './(tabs)/screens/customer/HomeScreen';
// import CartScreen from './(tabs)/screens/customer/CartScreen';
// import PaymentScreen from './(tabs)/screens/customer/PaymentScreen';

// import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
// import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
// import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';

// import Delivery_Screen from './(tabs)/screens/Delivery/Delivery_Screen';

// import { AuthProvider, AuthContext } from './(tabs)/AuthContext';

// const Stack = createNativeStackNavigator();

// function AppNavigator() {
//   const { token, loading } = useContext(AuthContext);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#00b894" />
//       </View>
//     );
//   }

//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {!token ? (
//         <>
//           <Stack.Screen name="Home" component={HomeScreen1} />
//           <Stack.Screen name="Register" component={RegisterScreen} />
//           <Stack.Screen name="Login" component={LoginScreen} />
//         </>
//       ) : (
//         <>
//           <Stack.Screen name="CustomerHome" component={HomeScreen} />
//           <Stack.Screen name="Cart" component={CartScreen} />
//           <Stack.Screen name="Payment" component={PaymentScreen} />
//           <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
//           <Stack.Screen name="Products" component={ProductsScreen} />
//           <Stack.Screen name="AdminOrders" component={OrdersScreen} />
//           <Stack.Screen name="Delivery" component={Delivery_Screen} />
//         </>
//       )}
//     </Stack.Navigator>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       {/* <NavigationContainer> */}
//         <AppNavigator />
//       {/* </NavigationContainer> */}
//     </AuthProvider>
//   );
// }


import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from './(tabs)/screens/LoginScreen';
import RegisterScreen from './(tabs)/screens/RegisterScreen';
import HomeScreen1 from './(tabs)/screens/Homescreen1';

import HomeScreen from './(tabs)/screens/customer/HomeScreen';
import CartScreen from './(tabs)/screens/customer/CartScreen';
import PaymentScreen from './(tabs)/screens/customer/PaymentScreen';
import ProfileScreen from './(tabs)/screens/customer/ProfileScreen';
import PastOrderScreen from './(tabs)/screens/customer/PastOrderScreen';
import { CartProvider } from "./(tabs)/screens/customer/CartContext"; 



import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';

import Delivery_Screen from './(tabs)/screens/Delivery/Delivery_Screen';

import { AuthProvider, AuthContext } from './(tabs)/AuthContext';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00b894" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen1} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : role === 'Admin' ? (
        <>
          <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="AdminOrders" component={OrdersScreen} />
        </>
      ) : role === 'Delivery' ? (
        <>
          <Stack.Screen name="Delivery" component={Delivery_Screen} />
        </>
      ) : (
        <>
          <Stack.Screen name="CustomerHome" component={HomeScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="PastOrder" component={PastOrderScreen} />


        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AuthProvider>
  );
}
