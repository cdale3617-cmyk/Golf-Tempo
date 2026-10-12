
import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SwingVideo = {
  id: string;
  uri: string;
  date: string;
};

const STORAGE_KEY = 'golf-tempo-recordings';
const VIDEO_DIR =
  FileSystem.documentDirectory + 'swing-videos/';

function SwingPlayer({
  uri,
  autoPlay,
}: {
  uri: string;
  autoPlay: boolean;
}) {
  const player = useVideoPlayer(uri, p => {
    p.loop = false;
  });

  useEffect(() => {
    if (!autoPlay) return;

    let cancelled = false;

    async function start() {
      try {
        await player.replaceAsync(uri);
        if (cancelled) return;

        player.currentTime = 0;
        player.play();
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Playback Error', String(error));
        }
      }
    }

    start();

    return () => {
      cancelled = true;
    };
  }, [player, uri, autoPlay]);

  return (
    <VideoView
      player={player}
      style={styles.camera}
      nativeControls
      contentFit="contain"
    />
  );
}

export default function RecordingScreen() {
  const camera = useRef<CameraView>(null);
  const scroll = useRef<ScrollView>(null);

  const [permission, requestPermission] =
    useCameraPermissions();

  const [cameraOpen, setCameraOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] =
    useState<string | null>(null);

  const [savedVideos, setSavedVideos] =
    useState<SwingVideo[]>([]);

  const [busy, setBusy] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await AsyncStorage.getItem(
        STORAGE_KEY
      );

      if (!data) return;

      const videos: SwingVideo[] = JSON.parse(data);
      const existing: SwingVideo[] = [];

      for (const video of videos) {
        const info = await FileSystem.getInfoAsync(
          video.uri
        );

        if (info.exists) existing.push(video);
      }

      setSavedVideos(existing);

      if (existing.length !== videos.length) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(existing)
        );
      }
    } catch (error) {
      Alert.alert('History Error', String(error));
    }
  }

  function showVideo(uri: string, play: boolean) {
    setCameraOpen(false);
    setVideoUri(uri);
    setAutoPlay(play);
    setPlayKey(value => value + 1);

    scroll.current?.scrollTo({
      y: 0,
      animated: true,
    });
  }

  async function openCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert('Camera permission required');
        return;
      }
    }

    setVideoUri(null);
    setAutoPlay(false);
    setCameraOpen(true);
  }

  async function startRecording() {
    if (!camera.current || recording) return;

    try {
      setRecording(true);

      const result = await camera.current.recordAsync({
        maxDuration: 60,
      });

      if (result?.uri) {
        showVideo(result.uri, false);
      }
    } catch (error) {
      Alert.alert('Recording Error', String(error));
    } finally {
      setRecording(false);
    }
  }

  function stopRecording() {
    camera.current?.stopRecording();
  }

  async function chooseVideo() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'],
          allowsEditing: false,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        showVideo(result.assets[0].uri, false);
      }
    } catch (error) {
      Alert.alert('Video Selection Error', String(error));
    }
  }

  async function saveVideo() {
    if (!videoUri || busy) return;

    setBusy(true);

    try {
      await FileSystem.makeDirectoryAsync(
        VIDEO_DIR,
        { intermediates: true }
      );

      const id =
        Date.now().toString() +
        '-' +
        Math.floor(Math.random() * 100000);

      const destination =
        VIDEO_DIR + 'swing-' + id + '.mp4';

      await FileSystem.copyAsync({
        from: videoUri,
        to: destination,
      });

      const newVideo: SwingVideo = {
        id,
        uri: destination,
        date: new Date().toLocaleString(),
      };

      const updated = [newVideo, ...savedVideos];

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        await FileSystem.deleteAsync(destination, {
          idempotent: true,
        });
        throw error;
      }

      setSavedVideos(updated);
      showVideo(destination, false);

      Alert.alert(
        'Video Saved',
        'Recording saved in Swing History.'
      );
    } catch (error) {
      Alert.alert('Save Failed', String(error));
    } finally {
      setBusy(false);
    }
  }

  async function playSavedVideo(video: SwingVideo) {
    try {
      const info = await FileSystem.getInfoAsync(
        video.uri
      );

      if (!info.exists) {
        Alert.alert(
          'Video Missing',
          'This recording could not be found.'
        );
        return;
      }

      showVideo(video.uri, true);
    } catch (error) {
      Alert.alert('Playback Error', String(error));
    }
  }

  function confirmDelete(video: SwingVideo) {
    Alert.alert(
      'Delete Recording',
      'Permanently delete this swing video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteVideo(video),
        },
      ]
    );
  }

  async function deleteVideo(video: SwingVideo) {
    if (busy) return;
    setBusy(true);

    try {
      const updated = savedVideos.filter(
        item => item.id !== video.id
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );

      setSavedVideos(updated);

      if (videoUri === video.uri) {
        setVideoUri(null);
        setAutoPlay(false);
      }

      await FileSystem.deleteAsync(video.uri, {
        idempotent: true,
      });
    } catch (error) {
      Alert.alert('Delete Error', String(error));
    } finally {
      setBusy(false);
    }
  }

  const alreadySaved = savedVideos.some(
    item => item.uri === videoUri
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.heading}>
          GOLF TEMPO
        </Text>

        <Text style={styles.subheading}>
          Swing Monitor
        </Text>

        {cameraOpen ? (
          <View style={styles.videoContainer}>
            <CameraView
              ref={camera}
              style={styles.camera}
              mode="video"
              facing="back"
              mute={true}
            />
          </View>
        ) : videoUri ? (
          <View style={styles.videoContainer}>
            <SwingPlayer
              key={playKey}
              uri={videoUri}
              autoPlay={autoPlay}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Record or choose a golf swing video
            </Text>
          </View>
        )}

        {cameraOpen ? (
          <Pressable
            style={styles.button}
            onPress={
              recording ? stopRecording : startRecording
            }
          >
            <Text style={styles.buttonText}>
              {recording
                ? 'STOP RECORDING'
                : 'START RECORDING'}
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={styles.button}
              onPress={openCamera}
            >
              <Text style={styles.buttonText}>
                RECORD SWING VIDEO
              </Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={chooseVideo}
            >
              <Text style={styles.buttonText}>
                CHOOSE VIDEO
              </Text>
            </Pressable>
          </>
        )}

        {videoUri && !cameraOpen && (
          <>
            <Text style={styles.status}>
              Video ready for review
            </Text>

            {!alreadySaved ? (
              <Pressable
                style={styles.button}
                onPress={saveVideo}
                disabled={busy}
              >
                <Text style={styles.buttonText}>
                  {busy ? 'SAVING...' : 'SAVE VIDEO'}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.savedStatus}>
                RECORDING SAVED
              </Text>
            )}
          </>
        )}

        <Text style={styles.historyTitle}>
          Recording History
        </Text>

        {savedVideos.length === 0 ? (
          <Text style={styles.emptyText}>
            No saved recordings yet
          </Text>
        ) : (
          savedVideos.map(video => (
            <View
              key={video.id}
              style={styles.historyRow}
            >
              <View style={styles.historyInfo}>
                <Text style={styles.historyDate}>
                  {video.date}
                </Text>

                <Text style={styles.historyLabel}>
                  Swing Recording
                </Text>
              </View>

              <Pressable
                style={styles.smallButton}
                onPress={() => playSavedVideo(video)}
              >
                <Text style={styles.smallButtonText}>
                  PLAY
                </Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => confirmDelete(video)}
                disabled={busy}
              >
                <Text style={styles.deleteText}>
                  DELETE
                </Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.footer}>
          DRC Golf Tempo - Swing Practice
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071C15',
  },
  content: {
    padding: 18,
    paddingBottom: 50,
  },
  heading: {
    color: '#D7B765',
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  subheading: {
    color: '#FFFFFF',
    fontSize: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  videoContainer: {
    width: '100%',
    height: 390,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#D7B765',
    borderRadius: 12,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  placeholder: {
    height: 390,
    backgroundColor: '#102B20',
    borderWidth: 2,
    borderColor: '#D7B765',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 17,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#B99748',
    padding: 17,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#071C15',
    fontWeight: 'bold',
    fontSize: 15,
  },
  status: {
    color: '#D7B765',
    textAlign: 'center',
    marginTop: 20,
  },
  savedStatus: {
    color: '#D7B765',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  historyTitle: {
    color: '#D7B765',
    fontSize: 21,
    fontWeight: 'bold',
    marginTop: 35,
    marginBottom: 15,
  },
  emptyText: {
    color: '#A8B5AB',
    textAlign: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#102B20',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B99748',
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  historyLabel: {
    color: '#D7B765',
    fontSize: 13,
    marginTop: 4,
  },
  smallButton: {
    backgroundColor: '#B99748',
    padding: 10,
    borderRadius: 7,
    marginRight: 6,
  },
  smallButtonText: {
    color: '#071C15',
    fontWeight: 'bold',
    fontSize: 11,
  },
  deleteButton: {
    borderColor: '#B99748',
    borderWidth: 1,
    padding: 9,
    borderRadius: 7,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  footer: {
    color: '#A8B5AB',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});
