import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Snackbar, Title, Divider, List, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';

const AddAddressScreen: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('Vietnam');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const userID = useSelector((state: RootState) => state.user._id);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const addressesJSON = await AsyncStorage.getItem(`addresses_${userID}`);
      if (addressesJSON) {
        setAddresses(JSON.parse(addressesJSON));
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
    }
  };

  const saveAddress = async () => {
    if (!fullName || !phone || !address || !city || !country) {
      setSnackbarMessage('Vui lòng điền đầy đủ thông tin.');
      setSnackbarVisible(true);
      return;
    }

    const newAddress = {
      fullName,
      phone,
      address,
      city,
      country,
    };

    try {
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify([...addresses, newAddress]));
      setSnackbarMessage('Địa chỉ đã được lưu.');
      setSnackbarVisible(true);
      setFullName('');
      setPhone('');
      setAddress('');
      setCity('');
      setCountry('Vietnam');
      loadAddresses(); // Reload addresses after saving
    } catch (error) {
      console.error('Không thể lưu địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const removeAddress = async (index: number) => {
    try {
      const updatedAddresses = addresses.filter((_, i) => i !== index);
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
      setSnackbarMessage('Địa chỉ đã được xóa.');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Không thể xóa địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể xóa địa chỉ. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title>Thêm địa chỉ mới</Title>
      <Divider style={styles.divider} />
      <TextInput
        label="Họ và tên"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        underlineColor="transparent"
        theme={{ colors: { text: 'white', primary: 'white', background: 'transparent' } }}
      />
      <TextInput
        label="Số điện thoại"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
        underlineColor="transparent"
        theme={{ colors: { text: 'white', primary: 'white', background: 'transparent' } }}
      />
      <TextInput
        label="Địa chỉ"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
        underlineColor="transparent"
        theme={{ colors: { text: 'white', primary: 'white', background: 'transparent' } }}
      />
      <TextInput
        label="Thành phố"
        value={city}
        onChangeText={setCity}
        style={styles.input}
        underlineColor="transparent"
        theme={{ colors: { text: 'white', primary: 'white', background: 'transparent' } }}
      />
      <TextInput
        label="Quốc gia"
        value={country}
        onChangeText={setCountry}
        style={styles.input}
        editable={false}
        underlineColor="transparent"
        theme={{ colors: { text: 'white', primary: 'white', background: 'transparent' } }}
      />
      <Button mode="contained" onPress={saveAddress} style={styles.button} labelStyle={styles.buttonLabel}>
        Lưu địa chỉ
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
      >
        {snackbarMessage}
      </Snackbar>

      <Divider style={styles.divider} />

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
          />
        ))}
      </List.Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#47CEFF',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 16,
    height: 50,
    backgroundColor: '#47CEFF',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
  },
  divider: {
    marginVertical: 10,
    backgroundColor: '#000',
  },
});

export default AddAddressScreen;
