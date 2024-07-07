import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Title, Divider, List, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { useRouter } from 'expo-router';

const AddressScreen: React.FC = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const userID = useSelector((state: RootState) => state.user._id);
  const router = useRouter();

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressesJSON = await AsyncStorage.getItem(`addresses_${userID}`);
        if (addressesJSON) {
          const storedAddresses = JSON.parse(addressesJSON);
          setAddresses(storedAddresses);
          if (storedAddresses.length > 0) {
            handleAddressChoose(storedAddresses[0]); // Select first address by default
          }
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
      }
    };

    fetchAddresses();
  }, [userID]);

  const removeAddress = async (index: number) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      Alert.alert('Thông báo', 'Đã xóa địa chỉ thành công.');
    } catch (error) {
      console.error('Không thể xóa địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleAddressChoose = (selectedAddress: any) => {
    // // Navigate back to OrderFormScreen and pass selected address
    // router.replace({
    //   pathname: 'OrderFormScreen',
    //   params: {
    //     selectedAddress: selectedAddress,
    //   },
    // });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Địa chỉ đã lưu</Title>
      <Divider style={styles.divider} />
      <List.Section>
        {addresses.map((addr, index) => (
          <List.Item
            key={index}
            title={`${addr.fullName}, ${addr.address}, ${addr.city}, ${addr.country}`}
            description={addr.phone}
            right={(props) => (
              <IconButton
                {...props}
                icon="delete"
                onPress={() => removeAddress(index)}
              />
            )}
            onPress={() => handleAddressChoose(addr)}
          />
        ))}
      </List.Section>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('AddAddressScreen')}>
        <Title style={styles.addButtonText}>Thêm địa chỉ mới</Title>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#000',
  },
  addButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#47CEFF',
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AddressScreen;
