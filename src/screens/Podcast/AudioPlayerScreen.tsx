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
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import podcastService from '../../services/api/podcastService';
import { Podcast } from '../../types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const DISC_SIZE = isTablet ? 300 : 250;

const AudioPlayerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const podcastId = route.params?.podcastId;

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const sound = useRef<Audio.Sound | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    loadPodcast();
    return () => {
      if (sound.current) sound.current.unloadAsync();
      rotateAnim.stopAnimation();
    };
  }, []);

  const loadPodcast = async () => {
    try {
      const res = await podcastService.getPodcastById(podcastId);
      setPodcast(res.data);
      await playAudio(res.data.duong_dan_audio);
    } catch (err) {
      console.error('Error loading podcast:', err);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (url: string) => {
    try {
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: url },
        {
          shouldPlay: true,
          isLooping: isRepeat,
          volume,
          rate: speed,
        },
        onPlaybackStatusUpdate
      );
      sound.current = newSound;
      setDuration(status.durationMillis ?? 0);
      setIsPlaying(true);
      startRotation();
    } catch (error) {
      console.error('Audio error:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: Audio.AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis ?? 0);

    if (status.didJustFinish) {
      setIsPlaying(false);
      setPosition(0);
      stopRotation();
    }
  };

  const togglePlayback = async () => {
    if (!sound.current) return;
    const status = await sound.current.getStatusAsync();
    if (status.isPlaying) {
      await sound.current.pauseAsync();
      setIsPlaying(false);
      stopRotation();
    } else {
      await sound.current.playAsync();
      setIsPlaying(true);
      startRotation();
    }
  };

  const handleSeek = async (value: number) => {
    if (sound.current) {
      await sound.current.setPositionAsync(value);
      setPosition(value);
    }
  };

  const changeVolume = async (value: number) => {
    setVolume(value);
    if (sound.current) {
      await sound.current.setVolumeAsync(value);
    }
  };

  const changeSpeed = async (value: number) => {
    setSpeed(value);
    if (sound.current) {
      await sound.current.setRateAsync(value, true);
    }
  };

  const toggleRepeat = () => setIsRepeat(!isRepeat);
  const toggleShuffle = () => setIsShuffle(!isShuffle);

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const startRotation = () => {
    rotateLoop.current = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải podcast...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: podcast.hinh_anh_dai_dien }}
        blurRadius={20}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{podcast.tieu_de}</Text>

        <View style={styles.discWrapper}>
          <Animated.Image
            source={{ uri: podcast.hinh_anh_dai_dien }}
            style={[styles.disc, { transform: [{ rotate: spin }] }]}
          />
        </View>

        <View style={styles.controlsWrapper}>
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#888"
              thumbTintColor="#4CAF50"
              onSlidingComplete={handleSeek}
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.playControlRow}>
            <TouchableOpacity onPress={toggleShuffle}>
              <Ionicons name="shuffle" size={24} color={isShuffle ? '#4CAF50' : '#ccc'} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-skip-back" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="play-skip-forward" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleRepeat}>
              <Ionicons name="repeat" size={24} color={isRepeat ? '#4CAF50' : '#ccc'} />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.volumeContainer}>
              <Ionicons name="volume-high" size={20} color="#fff" />
              <Slider
                style={styles.bottomSlider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={changeVolume}
                minimumTrackTintColor="#4CAF50"
                maximumTrackTintColor="#888"
                thumbTintColor="#4CAF50"
              />
            </View>

            <View style={styles.speedContainer}>
              {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                <TouchableOpacity key={rate} onPress={() => changeSpeed(rate)}>
                  <Text style={[styles.speedText, speed === rate && { color: '#4CAF50' }]}>
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    paddingTop: 80,
  },
  title: {
    color: '#fff',
    fontSize: isTablet ? 24 : 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  discWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: DISC_SIZE / 2,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  controlsWrapper: {
    width: '100%',
    marginTop: 20,
  },
  progressContainer: {
    width: '100%',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    color: '#ccc',
    fontSize: 14,
  },
  playControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 50,
    elevation: 10,
  },
  bottomControls: {
    marginTop: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomSlider: {
    flex: 1,
    marginLeft: 10,
  },
  speedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  speedText: {
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 8,
  },
});

export default AudioPlayerScreen;
