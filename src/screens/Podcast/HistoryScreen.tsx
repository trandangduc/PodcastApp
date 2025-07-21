import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { getHistory, clearHistory } from '../../services/api/historyService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử nghe</Text>
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="trash-outline" size={24} color="#ff4d4f" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('AudioPlayerScreen', { podcastId: item.id })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.timestamp}>
                🕒 {new Date(item.listenedAt).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lịch sử nghe.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', 
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  item: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
  },
});

export default HistoryScreen;
