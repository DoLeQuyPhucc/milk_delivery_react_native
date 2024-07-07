import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@/hooks/useNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/150' }} style={styles.profileImage} />
        <Text style={styles.userName}>John Doe</Text>
        <Text style={styles.userEmail}>john.doe@example.com</Text>
      </View>
      <View style={styles.body}>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Order History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemText}>Support</Text>
        </TouchableOpacity>
        <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  body: {
    padding: 20,
  },
  item: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  itemText: {
    fontSize: 18,
  },
});
