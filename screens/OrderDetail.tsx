  import React from 'react';
  import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
  import { useSelector } from 'react-redux';
  import { RootState } from '@/redux/store/store';

  const OrderDetailScreen = ({ route, navigation }: any) => {
    const { orderId } = route.params;
    const order = useSelector((state: RootState) => 
      state.orders.orders.find(order => order._id === orderId)
    );

    if (!order) {
      return <Text style={styles.error}>Order not found</Text>;
    }

    const handleReschedule = (trackingId: string) => {
      // Handle rescheduling logic here
      // Navigate to a screen or show a date picker to select a new date
    };

    const renderTracking = ({ item }: { item: any }) => (
      <View style={styles.trackingContainer}>
        <Text style={styles.trackingStatus}>Status: {item.status}</Text>
        <Text>Date: {item.deliveredAt}</Text>
        {item.status === 'Cancelled' || item.status === 'Failed' ? (
          <>
            <Text>Reason: {item.reason}</Text>
            <Button title="Reschedule" onPress={() => handleReschedule(item._id)} />
          </>
        ) : null}
      </View>
    );

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Order Detail</Text>
        <FlatList
          data={order.circleShipment.tracking}
          // keyExtractor={(item) => item._id}
          renderItem={renderTracking}
        />
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    trackingContainer: {
      padding: 16,
      marginBottom: 8,
      backgroundColor: '#fff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    trackingStatus: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    error: {
      fontSize: 18,
      textAlign: 'center',
      marginTop: 20,
      color: 'red',
    },
  });

  export default OrderDetailScreen;
