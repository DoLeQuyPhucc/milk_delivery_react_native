import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements'

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Button>
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
