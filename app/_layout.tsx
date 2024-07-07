import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from '@/redux/store/store';
import 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthLoadingScreen from './AuthLoadingScreen';
import fonts from '@/config/fonts';
import Toast from 'react-native-toast-message';
import WelcomeScreen from './WelcomeScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ProductDetail from './ProductDetail';
import PackageDetail from './PackageDetail';
import OrderFormScreen from './OrderFormScreen';
import OrderResultScreen from './OrderResultScreen';
import CartScreen from './CartScreen';
import { Text } from 'react-native-elements';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts(fonts);
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
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

  if (!appIsReady || !fontsLoaded) {
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
              OrderFormScreen: 'order-form',
              OrderResultScreen: 'order-result',
              CartScreen: 'cart',
              PaymentResultScreen: 'payment-result',
              NotFound: '*',
            },
          },
        }}
      >
        <Stack.Navigator initialRouteName="WelcomeScreen">
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetail} options={{ headerShown: false }} />
          <Stack.Screen name="PackageDetail" component={PackageDetail} options={{ headerShown: false }} />
          <Stack.Screen name="OrderFormScreen" component={OrderFormScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OrderResultScreen" component={OrderResultScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CartScreen" component={CartScreen} options={{ headerShown: false }} />
          <Stack.Screen name="NotFound" component={() => <Text>Not Found</Text>} options={{ headerShown: false }} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}
