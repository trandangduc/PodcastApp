// PodcastDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Podcast } from '../../types';
import podcastService from '../../services/api/podcastService';
import favoritesService from '../../services/api/favoritesService';

import PodcastHeader from '../../components/PodcastHeader';
import PodcastContent from '../../components/PodcastContent';

const PodcastDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const podcastId = route.params?.podcastId;

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (podcastId) {
      loadPodcastDetail();
      checkFavoriteStatus();
    }
  }, [podcastId]);

  const loadPodcastDetail = async () => {
    try {
      setLoading(true);
      const response = await podcastService.getPodcastById(podcastId);
      setPodcast(response.data);
      setSuggestedPodcasts(response.suggest || []);
    } catch (error: any) {
      console.error('Error loading podcast detail:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết podcast');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await favoritesService.isFavorite(podcastId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!podcast) return;
    
    try {
      setFavoriteLoading(true);
      const newFavoriteStatus = await favoritesService.toggleFavorite(podcast);
      setIsFavorite(newFavoriteStatus);
      
      Alert.alert(
        'Thành công', 
        newFavoriteStatus ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích'
      );
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handlePlay = () => {
    navigation.navigate('AudioPlayerScreen', { podcastId: podcast?.id });
  };

  const handleSuggestedPodcastPress = (suggestedPodcast: Podcast) => {
    navigation.push('PodcastDetail', { podcastId: suggestedPodcast.id });
  };

  return (
    <View style={styles.container}>
      <PodcastHeader podcast={podcast} />
      
      <PodcastContent
        podcast={podcast}
        suggestedPodcasts={suggestedPodcasts}
        loading={loading}
        isFavorite={isFavorite}
        favoriteLoading={favoriteLoading}
        onPlay={handlePlay}
        onToggleFavorite={toggleFavorite}
        onSuggestedPodcastPress={handleSuggestedPodcastPress}
        insets={insets}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default PodcastDetailScreen;