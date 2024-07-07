import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements'

export default function NotificationScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Button onPress={() => router.push('OrderResultScreen')}>
        Get Result
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 32,
    backgroundColor: '#fff',
  },
})
