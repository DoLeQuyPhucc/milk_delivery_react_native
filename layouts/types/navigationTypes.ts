export type RootStackParamList = {
  Main: {
    screen: keyof BottomTabParamList;
  };
  HomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  WelcomeScreen: undefined;
  AuthLoadingScreen: undefined;
  ProductDetail: undefined;
  PackageDetail: undefined;
  CartScreen: undefined;
  ProfileScreen: undefined;
  OrderScreen: undefined;
  OrderForm: undefined;
  OrderResult: { orderData: string } | { vnpayData: string };
  AddressScreen: undefined;
  AddAddressScreen: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Orders: undefined;
  Profile: undefined;
};
