import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useRouter } from 'expo-router';
import { callApi } from '@/hooks/useAxios';
import { Header } from 'react-native-elements';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

const OrderFormScreen: React.FC = () => {
  const { package: packageDetail } = useSelector((state: RootState) => state.packageDetail);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPay');
  const [numberOfShipment, setNumberOfShipment] = useState<number>(3);
  const [deliveryCombo, setDeliveryCombo] = useState<string>('2-4-6');
  const [deliveredAt, setDeliveredAt] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [startDeliveryDate, setStartDeliveryDate] = useState<string>('');

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem('id');
      return id;
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
  };

  const calculateNextDeliveryDate = useCallback((currentDate: Date, combo: string) => {
    let nextDeliveryDate = new Date(currentDate);
    let targetDay: number;
  
    if (combo === '2-4-6') {
      targetDay = 1; // Monday
    } else if (combo === '3-5-7') {
      targetDay = 2; // Tuesday
    } else {
      return nextDeliveryDate;
    }
  
    // If today is already the target day, use it; otherwise, find the next target day
    if (nextDeliveryDate.getDay() !== targetDay) {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + ((7 + targetDay - nextDeliveryDate.getDay()) % 7));
    }
  
    // If the calculated date is in the past, move to the next week's target day
    if (nextDeliveryDate <= currentDate) {
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 7);
    }
  
    return nextDeliveryDate;
  }, []);
  
  useEffect(() => {
    const nextDeliveryDate = calculateNextDeliveryDate(new Date(), deliveryCombo);
    setDeliveredAt(nextDeliveryDate);
    setStartDeliveryDate(nextDeliveryDate.toLocaleDateString('vi-VN'));
  }, [deliveryCombo, calculateNextDeliveryDate]);
  
  const handleConfirm = (date: Date) => {
    setDatePickerVisibility(false);

    const selectedDay = date.getDay();
    const validDays = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];

    if (!validDays.includes(selectedDay)) {
      Alert.alert('Error', 'Selected delivery date does not match the delivery days. Please choose a valid date.');
      return;
    }

    setDeliveredAt(date);
    setStartDeliveryDate(date.toLocaleDateString('vi-VN'));
  };

  const handleVNPayPayment = async (orderData: any) => {
    if (!orderData.shippingAddress.fullName) {
      Alert.alert('Error', 'Full Name is required');
      return;
    }
    if (!orderData.shippingAddress.phone) {
      Alert.alert('Error', 'Phone is required');
      return;
    }
    if (!orderData.shippingAddress.address) {
      Alert.alert('Error', 'Address is required');
      return;
    }
    if (!orderData.shippingAddress.city) {
      Alert.alert('Error', 'City is required');
      return;
    }
    if (!orderData.shippingAddress.country) {
      Alert.alert('Error', 'Country is required');
      return;
    }

    try {
      const response = await callApi('POST', '/api/payments/create_payment_url', {
        ...orderData,
        amount: packageDetail?.totalPrice,
      });

      const vnpUrl = response.vnpUrl;
      console.log("vnpUrl: ", vnpUrl);
      


      if (vnpUrl) {
        await WebBrowser.openBrowserAsync(vnpUrl);
      } else {
        Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate VNPay payment. Please try again.');
    }
  };

  const handleSubmit = async () => {
    const userId = await getUserId();

    if (!packageDetail) return;

    const deliveryDayNums = deliveryCombo === '2-4-6' ? [1, 3, 5] : [2, 4, 6];
    const deliveryDay = deliveredAt.getDay();

    if (!deliveryDayNums.includes(deliveryDay)) {
      Alert.alert('Error', 'Selected delivery date does not match the delivery days.');
      return;
    }

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
      userID: userId,
      isPaid: paymentMethod === 'VNPay',
      paidAt: paymentMethod === 'VNPay' ? new Date().toISOString() : null,
      deliveredAt: deliveredAt.toISOString(),
      numberOfShipment,
    };

    if (paymentMethod === 'VNPay') {
      await handleVNPayPayment(orderData);
    } else {
      try {
        await callApi('POST', '/api/orders', orderData);
        Alert.alert('Success', 'Order created successfully!');
        router.push('/OrderSuccessScreen');
      } catch (error) {
        Alert.alert('Error', 'Failed to create order. Please try again.');
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Header
          leftComponent={{
            icon: 'arrow-back',
            color: 'black',
            onPress: () => router.back(),
          }}
          containerStyle={{ backgroundColor: '#fff' }}
        />
        <Text style={styles.title}>Order Form</Text>
        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity style={[styles.optionButton, paymentMethod === 'VNPay' && styles.selectedOption]} onPress={() => setPaymentMethod('VNPay')}>
            <Text style={styles.optionText}>VNPay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, paymentMethod === 'Cash' && styles.selectedOption]} onPress={() => setPaymentMethod('Cash')}>
            <Text style={styles.optionText}>Cash</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Number of Shipments</Text>
        <View style={styles.shipmentOptions}>
          <TouchableOpacity style={[styles.optionButton, numberOfShipment === 3 && styles.selectedOption]} onPress={() => setNumberOfShipment(3)}>
            <Text style={styles.optionText}>1 tuần</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, numberOfShipment === 12 && styles.selectedOption]} onPress={() => setNumberOfShipment(12)}>
            <Text style={styles.optionText}>1 tháng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.optionButton, numberOfShipment === 24 && styles.selectedOption]} onPress={() => setNumberOfShipment(24)}>
            <Text style={styles.optionText}>2 tháng</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Delivery Combo</Text>
        <View style={styles.deliveryComboOptions}>
          <TouchableOpacity style={[styles.comboButton, deliveryCombo === '2-4-6' && styles.selectedCombo]} onPress={() => setDeliveryCombo('2-4-6')}>
            <Text style={styles.comboText}>2-4-6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.comboButton, deliveryCombo === '3-5-7' && styles.selectedCombo]} onPress={() => setDeliveryCombo('3-5-7')}>
            <Text style={styles.comboText}>3-5-7</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Start Delivery Date</Text>
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
          <TextInput style={styles.input} placeholder="Delivery Date" value={startDeliveryDate} editable={false} />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <Text style={styles.label}>Price: {packageDetail?.totalPrice}</Text>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
  },
  selectedOption: {
    backgroundColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  shipmentOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  deliveryComboOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  comboButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 4,
  },
  selectedCombo: {
    backgroundColor: '#ccc',
  },
  comboText: {
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderFormScreen;
