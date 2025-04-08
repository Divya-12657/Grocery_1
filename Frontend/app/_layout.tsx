// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useFonts } from 'expo-font';
// import { Stack } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/useColorScheme';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
 // }
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from './(tabs)/screens/LoginScreen';
// import HomeScreen from './(tabs)/screens/customer/HomeScreen';
// import CartScreen from './(tabs)/screens/customer/CartScreen';
// import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
// import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
// import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';

import LoginScreen from './(tabs)/screens/LoginScreen';
import HomeScreen from './(tabs)/screens/customer/HomeScreen';
import CartScreen from './(tabs)/screens/customer/CartScreen';
import AdminHomeScreen from './(tabs)/screens/admin/HomeScreen';
import ProductsScreen from './(tabs)/screens/admin/ProductsScreen';
import OrdersScreen from './(tabs)/screens/admin/OrdersScreen';
import PaymentScreen from './(tabs)/screens/customer/PaymentScreen';
import { AuthProvider } from './(tabs)/AuthContext';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CustomerHome" 
          component={HomeScreen} 
          options={{ title: 'Home' }}
        />
        <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ title: 'Shopping Cart' }}
        />
        <Stack.Screen 
          name="AdminHome" 
          component={AdminHomeScreen} 
          options={{ title: 'Admin Dashboard' }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen} 
          options={{ title: 'Manage Products' }}
        />
        <Stack.Screen 
          name="AdminOrders" 
          component={OrdersScreen} 
          options={{ title: 'Manage Orders' }}
        />

          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen} 
            options={{ title: 'Payment' }}
          />
          {/* <Stack.Screen 
            name="OrderConfirmation" 
            component={OrderConfirmation} 
            options={{ headerShown: false }}
          />  */}


      </Stack.Navigator>
      </AuthProvider>
    
  );
}
