import React, { useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import store from '@/redux/store/store';
import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '@/screens/WelcomeScreen';
import AuthLoadingScreen from '@/screens/AuthLoadingScreen';
import ProductDetail from '../screens/ProductDetail';
import PackageDetail from '../screens/PackageDetail';
import OrderFormScreen from '../screens/OrderFormScreen';
import OrderResultScreen from '../screens/OrderResultScreen';
import CartScreen from '../screens/CartScreen';
import OrderScreen from '@/screens/OrderScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import CustomBottomTab, { TabBarProps } from './BottomBar';
import fonts from '@/config/fonts';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types/navigationTypes';
import useAuth from '@/hooks/useAuth';

const Stack = createStackNavigator<RootStackParamList>();

const tabBarProps: TabBarProps[] = [
  {
    route: 'Home',
    component: HomeScreen,
    tabBarLabel: 'Home',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'home-outline',
    },
  },
  {
    route: 'Orders',
    component: OrderScreen,
    tabBarLabel: 'Orders',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'list-outline',
    },
  },
  {
    route: 'Profile',
    component: ProfileScreen,
    tabBarLabel: 'Profile',
    tabBarIconProps: {
      iconType: Ionicons,
      iconName: 'person-outline',
    },
  },
];

export default function Navigation() {
  useAuth(); // Call the custom hook

  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts(fonts);
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (accessToken && refreshToken) {
          setInitialRoute('Main');
        } else {
          setInitialRoute('WelcomeScreen');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded || !initialRoute) {
    return null;
  }

  return (
    <Provider store={store}>
      <NavigationContainer
        theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        linking={{
          prefixes: ['exp://192.168.1.8:8081/'],
          config: {
            screens: {
              WelcomeScreen: 'welcome',
              LoginScreen: 'login',
              RegisterScreen: 'register',
              ProductDetail: 'product-detail',
              PackageDetail: 'package-detail',
              OrderForm: 'order-form',
              OrderResult: 'order-result',
              CartScreen: 'cart',
              NotFound: '*',
            },
          },
        }}
      >
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {() => <CustomBottomTab tabs={tabBarProps} />}
          </Stack.Screen>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false }} />
          <Stack.Screen name="PackageDetail" component={PackageDetail} options={{ headerShown: false }} />
          <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderScreen" component={OrderScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderForm" component={OrderFormScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderResult" component={OrderResultScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}
