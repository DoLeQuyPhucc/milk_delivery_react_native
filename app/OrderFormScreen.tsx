import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableHighlight, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Appbar,
  TextInput,
  Button,
  RadioButton,
  Snackbar,
  Title,
  Paragraph,
  Divider,
  List,
} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { callApi } from '@/hooks/useAxios';

const OrderFormScreen: React.FC = () => {
  const { package: packageDetail } = useSelector((state: RootState) => state.packageDetail);
  const userID = useSelector((state: RootState) => state.user._id);

  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('Vietnam');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPay');
  const [numberOfShipment, setNumberOfShipment] = useState<string>('');
  const [deliveryCombo, setDeliveryCombo] = useState<string>('2-4-6');
  const [deliveredAt, setDeliveredAt] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [startDeliveryDate, setStartDeliveryDate] = useState<string>('');
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [addresses, setAddresses] = useState<any[]>([]); // State to store addresses

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const fetchAddresses = useCallback(async () => {
    try {
      const storedAddresses = await AsyncStorage.getItem(`addresses_${userID}`);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  }, [userID]);

  useEffect(() => {
    // Fetch addresses when component mounts
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0) {
      handleAddressSelect(addresses[0]);
    }
  }, [addresses]);

  useFocusEffect(
    useCallback(() => {
      // Fetch addresses when the screen is focused
      fetchAddresses();
    }, [fetchAddresses])
  );

  const saveAddresses = async (updatedAddresses: any[]) => {
    try {
      await AsyncStorage.setItem(`addresses_${userID}`, JSON.stringify(updatedAddresses));
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Failed to save addresses:', error);
    }
  };

  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);

    const selectedDay = date.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
    const validDays = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];

    if (!validDays.includes(selectedDay)) {
        Alert.alert('Error', 'Selected delivery date does not match the delivery days. Please choose a valid date.');
        return;
    }

    setDeliveredAt(date);
    setStartDeliveryDate(date.toLocaleDateString('vi-VN'));
    console.log("DeliveredAt: ", deliveredAt);
};

const handleSubmit = async () => {
    if (!packageDetail) return;

    if (!fullName || !phone || !address || !city || !country || !numberOfShipment || !startDeliveryDate) {
        setSnackbarMessage('Please fill in all fields.');
        setSnackbarVisible(true);
        return;
    }

    const deliveryDayNums = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];
    const deliveryDay = deliveredAt.getDay();

    if (!deliveryDayNums.includes(deliveryDay)) {
        Alert.alert('Error', 'Selected delivery date does not match the delivery days.');
        return;
    }

    const numShipment = parseInt(numberOfShipment);
    if (isNaN(numShipment)) {
        Alert.alert('Error', 'Number of Shipments must be a valid number.');
        return;
    }

    const formattedDeliveredAt = deliveredAt.toLocaleDateString('vi-VN');
    const formattedPaidAt = paymentMethod === 'VNPay' ? new Date().toLocaleDateString('vi-VN') : null;

    const orderData = {
        packageID: packageDetail._id,
        shippingAddress: {
            fullName,
            phone,
            address,
            city,
            country,
        },
        paymentMethod,
        userID,
        isPaid: paymentMethod === 'VNPay',
        paidAt: formattedPaidAt,
        deliveredAt: formattedDeliveredAt,
        numberOfShipment: numShipment,
    };

    console.log('Order data:', orderData);

    try {
        if (paymentMethod === 'VNPay') {
            await handleVNPayPayment(orderData);
        } else {
            const response = await callApi('POST', '/api/orders', orderData);
            Alert.alert('Success', 'Order created successfully!');
            router.push({
                pathname: '/OrderResultScreen',
                params: { orderData: JSON.stringify(response) }
            });
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to create order. Please try again.');
    }
};

  const handleVNPayPayment = async (orderData: any) => {
    try {
      const response = await callApi('POST', '/api/payments/create_payment_url', {
        ...orderData,
        amount: packageDetail?.totalPrice,
      });

      const vnpUrl = response.vnpUrl;
      if (vnpUrl) {
        await WebBrowser.openBrowserAsync(vnpUrl);

        const returnResponse = await callApi('GET', '/api/payments/vnpay_return');
        if (returnResponse) {
          router.push({
            pathname: '/OrderResultScreen',
            params: { vnpayData: JSON.stringify(returnResponse) }
          });
        } else {
          Alert.alert('Error', 'Failed to get VNPay return data. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
    }
  };

  const handleAddressSelect = (selectedAddress: any) => {
    setFullName(selectedAddress.fullName);
    setPhone(selectedAddress.phone);
    setAddress(selectedAddress.address);
    setCity(selectedAddress.city);
    setCountry(selectedAddress.country);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: "transparent" }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Thanh toán" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Title style={styles.title}>Địa chỉ giao hàng</Title>
            <List.Section>
              {/* Render saved addresses */}
              {addresses.length === 0 ? (
                <List.Item
                  title="Chưa có địa chỉ nào"
                  description="Nhấn vào đây để thêm địa chỉ mới"
                  left={(props) => <List.Icon {...props} icon="map-marker" color="red" />}
                  onPress={() => router.push('AddressScreen')}
                  underlayColor="transparent"
                />
              ) : null}
              {addresses.map((addr, index) => (
                <TouchableHighlight key={index} onPress={() => router.push('AddressScreen')} underlayColor="transparent">
                  <List.Item
                    title={`${addr.fullName}, ${addr.address}, ${addr.city}, ${addr.country}`}
                    description={addr.phone}
                    left={(props) => <List.Icon {...props} icon="map-marker" color="red" />}
                  />
                </TouchableHighlight>
              ))}
            </List.Section>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.title}>Chi tiết đơn hàng</Title>
            {packageDetail && (
              <View>
                {packageDetail.products.map((product, index) => (
                  <View key={index} style={styles.productDetailContainer}>
                    <Image source={{ uri: product.product.productImage }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Paragraph>{product.product.name}</Paragraph>
                      <Paragraph>Thương hiệu: {product.product.brandID.name}</Paragraph>
                      <Paragraph>Số lượng: {product.quantity}</Paragraph>
                      <Paragraph>Giá tiền: {product.product.price}</Paragraph>
                    </View>
                  </View>
                ))}
                <Paragraph style={{fontWeight: "bold", color: "red"}}>Tổng cộng: {packageDetail.totalPrice} VND</Paragraph>
              </View>
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.title}>Phương thức thanh toán</Title>
            <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="VNPay" />
                <Paragraph>Thanh toán VNPay</Paragraph>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="COD" />
                <Paragraph>Thanh toán khi nhận hàng (COD)</Paragraph>
              </View>
            </RadioButton.Group>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title style={styles.title}>Lịch giao hàng</Title>
            <TextInput
              label="Số lần giao hàng"
              value={numberOfShipment}
              onChangeText={setNumberOfShipment}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <Paragraph>Chọn combo giao hàng:</Paragraph>
            <RadioButton.Group onValueChange={value => setDeliveryCombo(value)} value={deliveryCombo}>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="2-4-6" />
                <Paragraph>Thứ 2-4-6</Paragraph>
              </View>
              <View style={styles.radioButtonContainer}>
                <RadioButton value="3-5-7" />
                <Paragraph>Thứ 3-5-7</Paragraph>
              </View>
            </RadioButton.Group>

            <Button onPress={() => setDatePickerVisibility(true)} mode="outlined">
              Chọn ngày bắt đầu giao
            </Button>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              minimumDate={new Date()}
              onCancel={() => setDatePickerVisibility(false)}
            />
            {startDeliveryDate && <Paragraph style={{marginTop: 15}}>Ngày bắt đầu giao hàng: {startDeliveryDate}</Paragraph>}
          </View>

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            Đặt hàng
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productDetailContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  submitButton: {
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#47CEFF'
  },
  divider: {
    height: 2,
    backgroundColor: 'gray',
    marginVertical: 16,
  },
});

export default OrderFormScreen;
