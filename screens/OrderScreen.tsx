import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Text, View, Image, FlatList, StyleSheet } from 'react-native';
import { AppDispatch, RootState } from '@/redux/store/store';
import { fetchOrders, makeSelectOrdersByStatus, selectOrdersLoading, selectOrdersError } from '@/redux/slices/orderSlice';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@/hooks/useNavigation';

const Tab = createMaterialTopTabNavigator();

const OrderScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userID = useSelector((state: RootState) => state.user._id);

  useEffect(() => {
    if (userID) {
      dispatch(fetchOrders(userID));
    }
  }, [dispatch, userID]);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Pending" children={() => <OrderList status="Pending" />} />
      <Tab.Screen name="Out for Delivery" children={() => <OrderList status="Out for Delivery" />} />
      <Tab.Screen name="Delivered" children={() => <OrderList status="Delivered" />} />
      <Tab.Screen name="Cancelled" children={() => <OrderList status="Cancelled" />} />
    </Tab.Navigator>
  );
};

const OrderList = ({ status }: { status: string }) => {
  const selectOrdersByStatus = React.useMemo(() => makeSelectOrdersByStatus(status), [status]);
  const orders = useSelector(selectOrdersByStatus);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const navigation = useNavigation();

  const renderProduct = ({ item: productItem }: { item: any }) => (
    <View style={styles.productContainer}>
      <Image source={{ uri: productItem.product.productImage }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.productName}>{productItem.product.name}</Text>
        <Text style={styles.description}>{productItem.product.description}</Text>
        <Text style={styles.price}>Price: {productItem.product.price} VND</Text>
        <Text style={styles.quantity}>Quantity: {productItem.quantity}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderContainer}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item._id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.header}>Order Date: {item.deliveredAt}</Text>
        <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status}</Text>
      </View>
      <FlatList
        data={item.package.products}
        keyExtractor={(product) => product._id}
        renderItem={renderProduct}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Price:</Text>
        <Text style={styles.totalPrice}>{item.package.totalPrice} VND</Text>
      </View>
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryLabel}>Shipments Delivered:</Text>
        <Text style={styles.deliveryCount}>
          {item.circleShipment.tracking.filter((track: any) => track.isDelivered).length} / {item.circleShipment.numberOfShipment}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }

  if (orders.length === 0) {
    return <Text style={styles.noOrders}>No orders found.</Text>;
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order._id}
      renderItem={renderOrder}
    />
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Pending':
      return { color: '#f39c12' };
    case 'Delivered':
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
    fontWeight: 'bold',
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
  deliveryInfo: {
    marginTop: 8,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryCount: {
    fontSize: 16,
    color: '#2980b9',
  },
});

export default OrderScreen;
