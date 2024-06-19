import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      router.replace('/LoginScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }


  return (
     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

