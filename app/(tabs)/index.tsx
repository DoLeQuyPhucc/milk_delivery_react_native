import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackages } from '@/redux/slices/packageSlice';
import { RootState, AppDispatch } from '@/redux/store/store';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import SkeletonLoader from '@/components/SkeletonHomeLoader';
import withRefreshControl from '@/components/withRefreshControl';

type RootStackParamList = {
  Home: undefined;
  PackageDetail: { id: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { packages, status, error } = useSelector((state: RootState) => state.packages);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  const promotionPackages = packages.slice(0, Math.ceil(packages.length / 2));
  const featuredPackages = packages.slice(Math.ceil(packages.length / 2));

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView>
        <ScrollView>
          {status === 'loading' ? (
            <SkeletonLoader />
          ) : (
            <View style={styles.container}>
              <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} placeholder="Search..." />
                <View style={styles.iconContainer}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => router.push('CartScreen')}>
                    <Icon name="shopping-cart" size={24} color="#000" />
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
                <TouchableOpacity style={styles.icon}>
                  <Image source={require('@/assets/images/th-true-milk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>TH True Milk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                  <Image source={require('@/assets/images/vinamilk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>Vinamilk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.icon}>
                  <Image source={require('@/assets/images/lothamilk.png')} style={styles.iconImage} />
                  <Text style={styles.iconText}>Lothamilk</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.promotionContainer}>
                <Text style={styles.promotionTitle}>Gói sữa đang khuyến mãi</Text>
                <FlatList
                  horizontal
                  data={promotionPackages}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PackageDetail', { id: item._id })}>
                      <View style={styles.package}>
                        <Image source={{ uri: item.products[0].product.productImage }} style={styles.productImage} />
                        <Text style={styles.packageName}>{item.products[0].product.name}</Text>
                        <Text style={styles.packagePrice}>
                          {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item._id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
              <View style={styles.featuredContainer}>
                <Text style={styles.featuredTitle}>Gói sữa nổi bật</Text>
                <FlatList
                  horizontal
                  data={featuredPackages}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('PackageDetail', { id: item._id })}>
                      <View style={styles.package}>
                        <Image source={{ uri: item.products[0].product.productImage }} style={styles.productImage} />
                        <Text style={styles.packageName}>{item.products[0].product.name}</Text>
                        <Text style={styles.packagePrice}>
                          {item.totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item._id}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

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
    marginBottom: 10,
    borderRadius: 10,
  },
  iconGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  icon: {
    alignItems: 'center',
  },
  iconImage: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  promotionContainer: {
    marginBottom: 20,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  package: {
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
  featuredContainer: {
    marginBottom: 20,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
    marginBottom: 5,
    color: 'red',
  },
});

export default withRefreshControl(HomeScreen);
