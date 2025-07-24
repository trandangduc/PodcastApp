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
import type { NavigationProp } from '@react-navigation/native';

// Define types
interface HistoryItem {
  id: number | string;
  image: string;
  title: string;
  listenedAt: string | Date;
}

type RootStackParamList = {
  AudioPlayerScreen: { podcastId: number | string };
  // Add other screens as needed
};

type NavigationType = NavigationProp<RootStackParamList>;

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigation = useNavigation<NavigationType>();

  const loadHistory = async (): Promise<void> => {
    try {
      const data: HistoryItem[] = await getHistory();
      setHistory(data || []); // Fallback to empty array if data is null/undefined
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadHistory);
    return unsubscribe;
  }, [navigation]);

  const handleClear = async (): Promise<void> => {
    try {
      await clearHistory();
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
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
  );

  const keyExtractor = (item: HistoryItem): string => item.id.toString();

  const ListEmptyComponent = () => (
    <Text style={styles.emptyText}>Chưa có lịch sử nghe.</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử nghe</Text>
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="trash-outline" size={24} color="#ff4d4f" />
        </TouchableOpacity>
      </View>
      <FlatList<HistoryItem>
        data={history}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
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