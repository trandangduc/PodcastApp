import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podcast App</Text>
      <Text style={styles.subtitle}>Setup hoàn thành - APP-001</Text>
      <Text style={styles.info}>Cấu trúc folder đã tạo </Text>
      <Text style={styles.info}>Dependencies đã cài </Text>
      <Text style={styles.info}>Types đã định nghĩa </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
});