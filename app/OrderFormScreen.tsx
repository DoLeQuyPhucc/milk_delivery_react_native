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
import * as Location from 'expo-location';
import StepIndicator from 'react-native-step-indicator';

const OrderFormScreen: React.FC = () => {
  const { package: packageDetail } = useSelector((state: RootState) => state.packageDetail);
  const userID = useSelector((state: RootState) => state.user._id);
  console.log('User ID:', userID);
  
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPay');
  const [numberOfShipment, setNumberOfShipment] = useState<string>('');
  const [deliveryCombo, setDeliveryCombo] = useState<string>('2-4-6');
  const [deliveredAt, setDeliveredAt] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [startDeliveryDate, setStartDeliveryDate] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        setLocationLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      let response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response.length > 0) {
        let { city, region, country } = response[0];
        setCity(city || '');
        setCountry(country || '');
        setAddress(`${city}, ${region}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
    setLocationLoading(false);
  };

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

        const returnResponse = await callApi('GET', '/api/payments/vnpay_return');
        if (returnResponse) {
          router.push({
            pathname: '/OrderSuccessScreen',
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

  const handleSubmit = async () => {
  
    if (!packageDetail) return;
  
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
      paidAt: paymentMethod === 'VNPay' ? new Date().toISOString() : null,
      deliveredAt: deliveredAt.toISOString(),
      numberOfShipment: numShipment,
    };
  
    console.log('orderData:', orderData);
  
    try {
      if (paymentMethod === 'VNPay') {
        await handleVNPayPayment(orderData);
      } else {
        const response = await callApi('POST', '/api/orders', orderData);
        console.log('order response:', response);
        Alert.alert('Success', 'Order created successfully!');
        router.push({
          pathname: '/OrderSuccessScreen',
          params: { orderData: JSON.stringify(response) }
        });
      }
    } catch (error) {
      console.error('Error handling submission:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name:</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
            />
            <Text style={styles.label}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address"
            />
            <Text style={styles.label}>City:</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Enter your city"
            />
            <Text style={styles.label}>Country:</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Enter your country"
            />
            <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
              <Text style={styles.locationButtonText}>
                {locationLoading ? 'Locating...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Number of Shipments:</Text>
            <TextInput
              style={styles.input}
              value={numberOfShipment}
              onChangeText={setNumberOfShipment}
              placeholder="Enter number of shipments"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Choose Combo Days:</Text>
            <View style={styles.comboContainer}>
              <TouchableOpacity
                style={[styles.comboButton, deliveryCombo === '2-4-6' && styles.selectedButton]}
                onPress={() => setDeliveryCombo('2-4-6')}
              >
                <Text style={[styles.comboText, deliveryCombo === '2-4-6' && styles.selectedText]}>2-4-6</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.comboButton, deliveryCombo === '3-5-7' && styles.selectedButton]}
                onPress={() => setDeliveryCombo('3-5-7')}
              >
                <Text style={[styles.comboText, deliveryCombo === '3-5-7' && styles.selectedText]}>3-5-7</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Choose Payment Method:</Text>
            <View style={styles.paymentContainer}>
              <TouchableOpacity
                style={[styles.paymentButton, paymentMethod === 'VNPay' && styles.selectedButton]}
                onPress={() => setPaymentMethod('VNPay')}
              >
                <Text style={[styles.paymentText, paymentMethod === 'VNPay' && styles.selectedText]}>VNPay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentButton, paymentMethod === 'Cash' && styles.selectedButton]}
                onPress={() => setPaymentMethod('Cash')}
              >
                <Text style={[styles.paymentText, paymentMethod === 'Cash' && styles.selectedText]}>Cash</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Select Start Delivery Date:</Text>
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
              <Text style={styles.datePicker}>{startDeliveryDate || 'Choose a start date'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={() => setDatePickerVisibility(false)}
              minimumDate={new Date()}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <Header
        leftComponent={{
          icon: 'arrow-back',
          color: '#fff',
          onPress: () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev)),
        }}
        centerComponent={{ text: 'Order Form', style: { color: '#fff', fontSize: 20 } }}
        containerStyle={styles.header}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <StepIndicator
          stepCount={2}
          customStyles={stepIndicatorStyles}
          currentPosition={currentStep}
          labels={['Delivery Address', 'Delivery Details']}
        />
        {renderStepContent()}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={() => setCurrentStep((prev) => prev - 1)}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
          )}
          {currentStep < 1 ? (
            <TouchableOpacity style={styles.nextButton} onPress={() => setCurrentStep((prev) => prev + 1)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const stepIndicatorStyles = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 40,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#fe7013',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#fe7013',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#fe7013',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#fe7013',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 15,
  currentStepIndicatorLabelFontSize: 15,
  stepIndicatorLabelCurrentColor: '#fe7013',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: '#fe7013'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fe7013',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#fe7013',
    padding: 12,
    borderRadius: 4,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  comboContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  comboButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  comboText: {
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: '#fe7013',
  },
  selectedText: {
    color: '#fff',
  },
  paymentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  paymentButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 16,
  },
  datePicker: {
    fontSize: 16,
    color: '#fe7013',
    textAlign: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prevButton: {
    backgroundColor: '#fe7013',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#fe7013',
    padding: 12,
    borderRadius: 4,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#fe7013',
    padding: 12,
    borderRadius: 4,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderFormScreen;
