import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, View, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { AppDispatch, RootState } from '@/redux/store/store';
import { fetchOrders } from '@/redux/slices/orderSlice';
import { useNavigation } from '@react-navigation/native';

const OrderScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const userID = useSelector((state: RootState) => state.user._id);
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    if (userID) {
      dispatch(fetchOrders(userID));
    }
  }, [dispatch, userID]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.orderContainer}>
      <View style={styles.orderHeader}>
        <Text style={styles.header}>Order ID: {item._id}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <Text style={styles.orderDate}>Order Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <FlatList
        data={item.package.products}
        keyExtractor={(product) => product._id}
        renderItem={({ item: productItem }) => (
          <View style={styles.productContainer}>
            <Image source={{ uri: productItem.product.productImage }} style={styles.image} />
            <View style={styles.details}>
              <Text style={styles.productName}>{productItem.product.name}</Text>
              <Text style={styles.description}>{productItem.product.description}</Text>
              <Text style={styles.price}>Price: {productItem.product.price} VND</Text>
              <Text style={styles.quantity}>Quantity: {productItem.quantity}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Price:</Text>
        <Text style={styles.totalPrice}>{item.totalPrice} VND</Text>
      </View>
    </View>
  );

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }

  if (orders.length === 0) {
    return <Text style={styles.noOrders}>You have no orders yet.</Text>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <FlatList
        data={orders}
        keyExtractor={(order) => order._id}
        renderItem={renderItem}
      />
    </View>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: '#f39c12' };
    case 'Completed':
      return { color: '#27ae60' };
    case 'Cancelled':
      return { color: '#e74c3c' };
    default:
      return { color: '#7f8c8d' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  orderContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  loading: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  noOrders: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d',
  },
  backButton: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default OrderScreen;
