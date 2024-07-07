import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store/store';
import { fetchPackages } from '@/redux/slices/packageSlice';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-elements';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

interface Package {
  _id: string;
  products: {
    product: {
      name: string;
      productImage: string;
    };
  }[];
  totalPrice: number;
}


const OrderResultScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const handleBuyAgain = () => {
    router.push('(tabs)');
  };

  const handleViewOrders = () => {
    router.push('(tabs)');
  };

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (url.includes('order-result')) {
        router.replace('OrderResultScreen');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const renderPackageItem = ({ item }: { item: Package }) => (
    <View style={styles.packageItem}>
      <Text style={styles.packageName}>{item.products[0].product.name}</Text>
      <Text style={styles.packagePrice}>
        {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.successMessage}>Order placed successfully!</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleBuyAgain}>
          <Text style={styles.buttonText}>Buy Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleViewOrders}>
          <Text style={styles.buttonText}>View Orders</Text>
        </TouchableOpacity>
      </View>
      <Divider style={styles.divider} />
      <Text style={styles.suggestionsTitle}>You might also like</Text>
      {status === 'loading' && <ActivityIndicator size="large" color="#fe7013" />}
      {status === 'failed' && <Text style={styles.errorText}>{error}</Text>}
      {status === 'succeeded' && (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 50,
    backgroundColor: '#fff',
  },
  successMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#fe7013',
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  packageItem: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 10,
    marginRight: 10,
    width: 150,
    height: 180,
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  packageName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default OrderResultScreen;
