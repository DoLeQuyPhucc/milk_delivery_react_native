import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackageById } from '@/redux/slices/packageDetailSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { CartItem, addToCart } from '@/redux/slices/cartSlice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Divider, Header } from 'react-native-elements';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import withRefreshControl from '@/components/withRefreshControl';

type RootStackParamList = {
  PackageDetail: { id: string };
};

type PackageDetailRouteProp = RouteProp<RootStackParamList, 'PackageDetail'>;

const PackageDetail: React.FC = () => {
  const route = useRoute<PackageDetailRouteProp>();
  const { id } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { package: packageDetail, status, error } = useSelector((state: RootState) => state.packageDetail);
  const toastRef = useRef<any>(null);

  const router = useRouter();

  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    dispatch(fetchPackageById(id));
  }, [dispatch, id]);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (packageDetail) {
      const cartItem: CartItem = {
        id: packageDetail._id,
        name: packageDetail.products[0]?.product.name || 'Unknown',
        price: packageDetail.totalPrice,
        quantity: quantity,
        productImage: packageDetail.products[0]?.product.productImage || '',
      };

      dispatch(addToCart(cartItem));
      if (toastRef.current) { 
        toastRef.current.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item added to cart successfully!',
        });
      }
    }
  };

  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (status === 'failed') {
    return <Text>Error: {error}</Text>;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Header
          leftComponent={{
            icon: 'arrow-back',
            color: 'black',
            onPress: () => router.back(),
          }}
          rightComponent={{
            icon: 'shopping-cart',
            color: 'black',
            onPress: () => router.push('CartScreen'),
          }}
          containerStyle={{ backgroundColor: '#f2f2f2' }}
        />
        {packageDetail && (
          <>
            <Image source={{ uri: packageDetail.products[0]?.product.productImage }} style={styles.image} />
            <Text style={styles.packageName}>{packageDetail.products[0]?.product.name || 'Package'}</Text>
            <Text style={styles.totalPrice}>
              {packageDetail.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Text>
            <Text style={styles.productCount}>Số lượng sản phẩm: {packageDetail.products.length}</Text>
            <Divider style={styles.divider} />

            {packageDetail.products.map((item) => (
              <View key={item.product._id} style={styles.productRow}>
                <Image source={{ uri: item.product.productImage }} style={styles.productImage} />
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.product.name}</Text>
                  <Text style={styles.productDescription}>{item.product.description}</Text>
                  <Text style={styles.productBrand}>Brand: {item.product.brandID.name}</Text>
                  <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
                </View>
                <Divider />
              </View>
            ))}
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cartIconContainer, styles.iconButton, { backgroundColor: 'green' }]}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-cart" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: '#FF6F61' }]}
            onPress={() => router.push('OrderFormScreen')}
          >
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 0,
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6F61',
    marginBottom: 10,
  },
  productCount: {
    fontSize: 16,
    marginBottom: 20,
  },
  divider: {
    marginVertical: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  cartIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  iconButton: {
    padding: 16,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  orderButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default withRefreshControl(PackageDetail);
