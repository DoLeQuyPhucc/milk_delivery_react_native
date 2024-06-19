import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/redux/slides/productSlide';
import { RootState, AppDispatch } from '@/redux/store/store';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, status, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    console.log("Dispatching fetchProducts");
    dispatch(fetchProducts());
  }, [dispatch]);

  const promotionProducts = products.slice(0, Math.ceil(products.length / 2));
  const featuredProducts = products.slice(Math.ceil(products.length / 2));

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <FlatList
          ListHeaderComponent={
            <View style={styles.container}>
              <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} placeholder="Search..." />
                <View style={styles.iconContainer}>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="qr-code" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Icon name="notifications" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
              <Image
                source={{ uri: 'https://cdn.tgdd.vn//News/1425889//sua-chua-th-true-milk-banner-845x264.png' }}
                style={styles.bannerImage}
              />
              <View style={styles.iconGroupContainer}>
                <View style={styles.icon}>
                  <Text>TH True Milk</Text>
                </View>
                <View style={styles.icon}>
                  <Text>Vinamilk</Text>
                </View>
                <View style={styles.icon}>
                  <Text>Lothamilk</Text>
                </View>
              </View>
              <View style={styles.promotionContainer}>
                <Text style={styles.promotionTitle}>Khuyến Mãi Sắp Sàn</Text>
                <FlatList
                  horizontal
                  data={promotionProducts}
                  renderItem={({ item }) => (
                    <View style={styles.product}>
                      <Text>{item.name}</Text>
                      <Image source={{ uri: item.productImage }} style={styles.productImage} />
                      <Text>{item.description}</Text>
                      <Text>{item.price} VND</Text>
                      <Text>In Stock: {item.stockQuantity}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item._id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
              <View style={styles.featuredContainer}>
                <Text>Sản Phẩm Nổi Bật</Text>
                <FlatList
                  horizontal
                  data={featuredProducts}
                  renderItem={({ item }) => (
                    <View style={styles.product}>
                      <Text>{item.name}</Text>
                      <Image source={{ uri: item.productImage }} style={styles.productImage} />
                      <Text>{item.description}</Text>
                      <Text>{item.price} VND</Text>
                      <Text>In Stock: {item.stockQuantity}</Text>
                    </View>
                  )}
                  keyExtractor={(item) => item._id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          }
          data={[]}
          renderItem={null}
          keyExtractor={() => 'dummy'}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
  bannerImage: {
    width: '100%', 
    height: 150, 
    resizeMode: 'contain', 
    marginBottom: 20, 
    borderRadius: 10,
  },
  iconGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  icon: {
    width: '30%',
    alignItems: 'center',
  },
  promotionContainer: {
    marginBottom: 20,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  product: {
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
  },
  featuredContainer: {
    marginBottom: 20,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
});
