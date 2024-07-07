import React from 'react';
import { Provider } from 'react-redux';
import { useFonts } from 'expo-font';
import store from './redux/store/store';
import Navigation from './layouts/Navigation';
import { NativeBaseProvider } from 'native-base';
import fonts from './config/fonts';

export default function App() {
  let [fontsLoaded] = useFonts(fonts);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <NativeBaseProvider>
        <Navigation />
      </NativeBaseProvider>
    </Provider>
  );
}
