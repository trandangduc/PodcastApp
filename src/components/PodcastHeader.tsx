// PodcastHeader.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Podcast } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;

interface PodcastHeaderProps {
  podcast?: Podcast | null;
}

const PodcastHeader: React.FC<PodcastHeaderProps> = ({ podcast }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleShare = async () => {
    if (!podcast) return;
    
    try {
      await Share.share({
        message: `Nghe podcast "${podcast.tieu_de}" - ${podcast.mo_ta}`,
        title: podcast.tieu_de,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>Chi tiết Podcast</Text>
      
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={handleShare}
        disabled={!podcast}
      >
        <Ionicons 
          name="share-outline" 
          size={24} 
          color={podcast ? "#ffffff" : "#666666"} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerButton: {
    width: isTablet ? 44 : 40,
    height: isTablet ? 44 : 40,
    borderRadius: isTablet ? 22 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});

export default PodcastHeader;