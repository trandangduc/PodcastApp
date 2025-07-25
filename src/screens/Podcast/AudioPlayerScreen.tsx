import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  Platform,
  Modal,
  AppState,
  AppStateStatus
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import podcastService from '../../services/api/podcastService';
import { Podcast } from '../../types';
import { saveToHistory } from '../../services/api/historyService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;
const DISC_SIZE = isTablet ? 320 : 280;

const AudioPlayerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const podcastId = route.params?.podcastId;

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);

  // Audio state management
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const rotateLoop = useRef<Animated.CompositeAnimation | null>(null);
  const appState = useRef(AppState.currentState);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }

    configureAudioSession();
    loadPodcast();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Cleanup audio properly
      if (sound) {
        sound.unloadAsync().catch(console.error);
      }
      rotateAnim.stopAnimation();
      subscription?.remove();
    };
  }, []);

  // Watch for playing state changes
  useEffect(() => {
    if (isPlaying) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [isPlaying]);

  const configureAudioSession = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error configuring audio session:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    appState.current = nextAppState;
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;

    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying || false);
    setIsBuffering(status.isBuffering || false);

    if (status.didJustFinish && !isRepeat) {
      setIsPlaying(false);
      setPosition(0);
      stopRotation();
    }
  };

  const loadPodcast = async () => {
    try {
      const res = await podcastService.getPodcastById(podcastId);
      const episode = res.data;
      setPodcast(episode);

      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
      }

      // Create and load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: episode.duong_dan_audio },
        {
          shouldPlay: true,
          isLooping: isRepeat,
          volume: volume,
          rate: speed,
          progressUpdateIntervalMillis: 1000,
        },
        onPlaybackStatusUpdate
      );

      setSound(newSound);

      await saveToHistory({
        id: episode.id,
        title: episode.tieu_de,
        image: episode.hinh_anh_dai_dien,
        audioUri: episode.duong_dan_audio,
      });
    } catch (err) {
      console.error('Error loading podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const stopPlayback = async () => {
    if (!sound) return;
    await sound.pauseAsync();
    await sound.setPositionAsync(0);
  };

  const skipBack = async () => {
    if (!sound) return;
    const newPosition = Math.max(0, position - 15000);
    await sound.setPositionAsync(newPosition);
  };

  const skipForward = async () => {
    if (!sound) return;
    const newPosition = Math.min(duration, position + 15000);
    await sound.setPositionAsync(newPosition);
  };

  const handleSeek = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const changeVolume = async (value: number) => {
    setVolume(value);
    if (sound) {
      await sound.setVolumeAsync(value);
    }
  };

  const changeSpeed = async (value: number) => {
    setSpeed(value);
    if (sound) {
      await sound.setRateAsync(value, true);
    }
  };

  const toggleRepeat = async () => {
    const newRepeat = !isRepeat;
    setIsRepeat(newRepeat);
    if (sound) {
      await sound.setIsLoopingAsync(newRepeat);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const openControlsModal = () => {
    setShowControlsModal(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeControlsModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControlsModal(false);
    });
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startRotation = () => {
    if (rotateLoop.current) {
      rotateLoop.current.stop();
    }
    rotateLoop.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.current.start();
  };

  const stopRotation = () => {
    rotateLoop.current?.stop();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading || !podcast) {
    return (
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#00d4ff" />
          <Text style={styles.loadingText}>Đang tải podcast...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Image with Blur */}
      <Image
        source={{ uri: podcast.hinh_anh_dai_dien }}
        blurRadius={50}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(26, 26, 46, 0.9)', 'rgba(22, 33, 62, 0.95)', 'rgba(15, 52, 96, 0.9)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Now Playing</Text>
        <TouchableOpacity style={styles.moreButton} onPress={openControlsModal}>
          <Ionicons name="options" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Album Art */}
        <View style={styles.albumContainer}>
          <View style={styles.discShadow}>
            <Animated.View style={[styles.discWrapper, { transform: [{ rotate: spin }] }]}>
              <Image
                source={{ uri: podcast.hinh_anh_dai_dien }}
                style={styles.disc}
              />
              <View style={styles.discCenter}>
                <View style={styles.discHole} />
              </View>
            </Animated.View>
          </View>
        </View>

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {podcast.tieu_de}
          </Text>
          <Text style={styles.artist}>Podcast</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Slider
            style={styles.progressSlider}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#00d4ff"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#00d4ff"
            onSlidingComplete={handleSeek}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={skipBack}>
            <Ionicons name="play-skip-back" size={32} color="#fff" />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <LinearGradient
                colors={['#00d4ff', '#0099cc']}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color="#fff"
                  style={isPlaying ? {} : { marginLeft: 3 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.controlButton} onPress={skipForward}>
            <Ionicons name="play-skip-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Controls Modal */}
      <Modal
        visible={showControlsModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeControlsModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeControlsModal} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Điều khiển</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeControlsModal}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Volume Control */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="volume-medium" size={20} color="#00d4ff" />
                <Text style={styles.sectionTitle}>Âm lượng</Text>
                <Text style={styles.sectionValue}>{Math.round(volume * 100)}%</Text>
              </View>
              <View style={styles.sliderContainer}>
                <Ionicons name="volume-low" size={16} color="rgba(255,255,255,0.5)" />
                <Slider
                  style={styles.modalSlider}
                  minimumValue={0}
                  maximumValue={1}
                  value={volume}
                  minimumTrackTintColor="#00d4ff"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#00d4ff"
                  onValueChange={changeVolume}
                />
                <Ionicons name="volume-high" size={16} color="rgba(255,255,255,0.5)" />
              </View>
            </View>

            {/* Speed Control */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="speedometer" size={20} color="#00d4ff" />
                <Text style={styles.sectionTitle}>Tốc độ phát</Text>
                <Text style={styles.sectionValue}>{speed}x</Text>
              </View>
              <View style={styles.speedGrid}>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speedValue) => (
                  <TouchableOpacity
                    key={speedValue}
                    style={[
                      styles.speedOption,
                      speed === speedValue && styles.speedOptionActive,
                    ]}
                    onPress={() => changeSpeed(speedValue)}
                  >
                    <Text
                      style={[
                        styles.speedOptionText,
                        speed === speedValue && styles.speedOptionTextActive,
                      ]}
                    >
                      {speedValue}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Playback Options */}
            <View style={styles.modalSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="settings" size={20} color="#00d4ff" />
                <Text style={styles.sectionTitle}>Tùy chọn</Text>
              </View>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    isRepeat && styles.optionButtonActive,
                  ]}
                  onPress={toggleRepeat}
                >
                  <Ionicons
                    name="repeat"
                    size={24}
                    color={isRepeat ? "#fff" : "rgba(255,255,255,0.7)"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      isRepeat && styles.optionTextActive,
                    ]}
                  >
                    Lặp lại
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    isShuffle && styles.optionButtonActive,
                  ]}
                  onPress={toggleShuffle}
                >
                  <Ionicons
                    name="shuffle"
                    size={24}
                    color={isShuffle ? "#fff" : "rgba(255,255,255,0.7)"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      isShuffle && styles.optionTextActive,
                    ]}
                  >
                    Ngẫu nhiên
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  albumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  discShadow: {
    shadowColor: '#00d4ff',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 25,
  },
  discWrapper: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    position: 'absolute',
  },
  discCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  discHole: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
  },
  songInfo: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: isTablet ? 34 : 30,
  },
  artist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  progressSection: {
    width: '100%',
    marginBottom: 40,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: '#00d4ff',
    shadowColor: '#00d4ff',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  playButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  sectionValue: {
    color: '#00d4ff',
    fontSize: 14,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSlider: {
    flex: 1,
    marginHorizontal: 16,
    height: 40,
  },
  speedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  speedOption: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  speedOptionActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  speedOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  speedOptionTextActive: {
    color: '#fff',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  optionButton: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  optionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  optionTextActive: {
    color: '#fff',
  },
});

export default AudioPlayerScreen;