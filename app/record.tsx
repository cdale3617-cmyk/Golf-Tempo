
import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function RecordingScreen() {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
  });

  async function openCamera() {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera permission required');
        return;
      }
    }
    setVideoUri(null);
    setCameraOpen(true);
  }

  async function startRecording() {
    try {
      if (!camera.current) return;
      setRecording(true);
      const result = await camera.current.recordAsync({
        maxDuration: 60,
      });
      if (result?.uri) {
        setVideoUri(result.uri);
        setCameraOpen(false);
      }
    } catch (error) {
      Alert.alert('Recording error', String(error));
    } finally {
      setRecording(false);
    }
  }

  function stopRecording() {
    camera.current?.stopRecording();
  }

  async function chooseVideo() {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Video library permission required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
        setCameraOpen(false);
      }
    } catch (error) {
      Alert.alert('Video selection error', String(error));
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>GOLF TEMPO</Text>
        <Text style={styles.subheading}>Swing Monitor</Text>

        {cameraOpen ? (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={camera}
              style={styles.camera}
              mode="video"
              facing="back"
              mute={true}
            />
          </View>
        ) : videoUri ? (
          <View style={styles.cameraContainer}>
            <VideoView
              player={player}
              style={styles.camera}
              nativeControls
              contentFit="contain"
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Record or select a golf swing video
            </Text>
          </View>
        )}

        {cameraOpen ? (
          <Pressable
            style={styles.button}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.buttonText}>
              {recording ? 'STOP RECORDING' : 'START RECORDING'}
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable style={styles.button} onPress={openCamera}>
              <Text style={styles.buttonText}>
                RECORD SWING VIDEO
              </Text>
            </Pressable>

            <Pressable style={styles.button} onPress={chooseVideo}>
              <Text style={styles.buttonText}>
                CHOOSE VIDEO
              </Text>
            </Pressable>
          </>
        )}

        {videoUri && (
          <Text style={styles.status}>
            Video ready for review
          </Text>
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
  cameraContainer: {
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
  footer: {
    color: '#A8B5AB',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
  },
});
