import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import DatePicker from 'react-native-date-picker';
import { useRouter } from 'expo-router';
import { callApi } from '@/hooks/useAxios';
import { Header } from 'react-native-elements';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const OrderFormScreen: React.FC = () => {
  const { package: packageDetail } = useSelector((state: RootState) => state.packageDetail);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('VNPay');
  const [numberOfShipment, setNumberOfShipment] = useState<number>(3);
  const [deliveryDays, setDeliveryDays] = useState<string[]>(['2', '4', '6']);
  const [deliveredAt, setDeliveredAt] = useState<Date>(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async () => {
    if (!packageDetail) return;

    const deliveryDayNums = deliveryDays.map(day => parseInt(day));
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
        country
      },
      paymentMethod,
      userID: '6663ce77a6116a98ba9b669c', // Assuming a static userID for now
      isPaid: true,
      paidAt: new Date().toISOString(),
      deliveredAt: deliveredAt.toISOString(),
      numberOfShipment,
    };

    try {
      await callApi('POST', '/api/orders', orderData);
      Alert.alert('Success', 'Order created successfully!');
      router.push('/OrderSuccessScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    }
  };

  const toggleDeliveryDay = (day: string) => {
    setDeliveryDays(prevDays =>
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day]
    );
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
          containerStyle={{ backgroundColor: '#f2f2f2' }}
        />
        <Text style={styles.title}>Order Form</Text>
        <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Address" value={address} onChangeText={setAddress} />
        <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Country" value={country} onChangeText={setCountry} />
        <TextInput style={styles.input} placeholder="Payment Method" value={paymentMethod} onChangeText={setPaymentMethod} />

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

        <Text style={styles.label}>Delivery Days</Text>
        <View style={styles.deliveryDaysOptions}>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('2') && styles.selectedDay]} onPress={() => toggleDeliveryDay('2')}>
            <Text style={styles.dayText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('4') && styles.selectedDay]} onPress={() => toggleDeliveryDay('4')}>
            <Text style={styles.dayText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('6') && styles.selectedDay]} onPress={() => toggleDeliveryDay('6')}>
            <Text style={styles.dayText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('3') && styles.selectedDay]} onPress={() => toggleDeliveryDay('3')}>
            <Text style={styles.dayText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('5') && styles.selectedDay]} onPress={() => toggleDeliveryDay('5')}>
            <Text style={styles.dayText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dayButton, deliveryDays.includes('7') && styles.selectedDay]} onPress={() => toggleDeliveryDay('7')}>
            <Text style={styles.dayText}>7</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Delivered At</Text>
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)}>
          <TextInput
            style={styles.input}
            placeholder="Select date"
            value={deliveredAt.toISOString().split('T')[0]}
            editable={false}
          />
        </TouchableOpacity>
        <DatePicker
          modal
          open={isDatePickerVisible}
          date={deliveredAt}
          mode="date"
          minimumDate={new Date()}
          onConfirm={(date) => {
            setDatePickerVisibility(false);
            setDeliveredAt(date);
          }}
          onCancel={() => setDatePickerVisibility(false)}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Order</Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  shipmentOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    padding: 10,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FF6F61',
  },
  optionText: {
    color: '#fff',
  },
  deliveryDaysOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  selectedDay: {
    backgroundColor: '#FF6F61',
  },
  dayText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#FF6F61',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default OrderFormScreen;
