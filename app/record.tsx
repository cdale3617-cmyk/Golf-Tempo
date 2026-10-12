import React, { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '@/components/AppText';
import { Feather } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ClipReview } from '@/components/ClipReview';
import { archiveVideo } from '@/utils/videoArchive';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActionButton, Card, EmptyNote, Field, IconButton, Page, PageHeading, Pill } from '@/components/Primitives';
import { useGolf } from '@/context/GolfContext';
import { useColors } from '@/hooks/useColors';

export default function RecordingScreen() {
  const colors = useColors
