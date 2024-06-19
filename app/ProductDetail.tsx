import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '@/redux/slices/productDetailSlice';
import { RootState, AppDispatch } from '@/redux/store/store';

type RootStackParamList = {
  ProductDetail: { id: string };
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const { id } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { product, status, error } = useSelector((state: RootState) => state.productDetail);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  if (status === 'loading') {
    return <Text>Loading...</Text>;
  }

  if (status === 'failed') {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      {product && (
        <>
          <Text style={styles.name}>{product.name}</Text>
          <Image source={{ uri: product.productImage }} style={styles.image} />
          <Text style={styles.description}>{product.description}</Text>
          <Text style={styles.price}>{product.price} VND</Text>
          <Text style={styles.stock}>In Stock: {product.stockQuantity}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stock: {
    fontSize: 16,
  },
});

export default ProductDetail;
