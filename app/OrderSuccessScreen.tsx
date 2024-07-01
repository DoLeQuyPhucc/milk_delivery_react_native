import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { RouteProp, useRoute } from '@react-navigation/native';

type OrderSuccessRouteProp = RouteProp<{ params: { vnpayData: string } }, 'params'>;

const OrderSuccessScreen: React.FC = () => {
  const route = useRoute<OrderSuccessRouteProp>();
  const router = useRouter();
  const { vnpayData } = route.params;

  let parsedData: any;
  try {
    parsedData = JSON.parse(vnpayData);
  } catch (error) {
    console.error('Failed to parse VNPay data:', error);
    parsedData = {
      message: 'Unknown error',
      code: 'N/A',
      data: {
        vnp_Amount: 'N/A',
        vnp_BankCode: 'N/A',
      },
    };
  }

  return (
    <GestureHandlerRootView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payment Success</Text>
        <Text style={styles.label}>Message: {parsedData.message}</Text>
        <Text style={styles.label}>Code: {parsedData.code}</Text>
        <Text style={styles.label}>Amount: {parsedData.data.vnp_Amount}</Text>
        <Text style={styles.label}>Bank Code: {parsedData.data.vnp_BankCode}</Text>
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push('(tabs)')}>
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  homeButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    borderRadius: 5,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OrderSuccessScreen;
