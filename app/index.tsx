
import React from 'react';
import { Link } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

export default function Home() {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.brand}>DRC</Text>

      <Text style={styles.heading}>
        GOLF TEMPO
      </Text>

      <Text style={styles.subtitle}>
        SWING PRACTICE
      </Text>

      <View style={styles.panel}>
        <Text style={styles.title}>
          Swing Monitor
        </Text>

        <Text style={styles.description}>
          Record a swing or select a video
          for review.
        </Text>

        <Link href="/record" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>
              OPEN SWING MONITOR
            </Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.note}>
        Additional golf tools will be
        restored when their original
        source files are available.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071C15',
  },
  content: {
    padding: 22,
    paddingTop: 70,
    paddingBottom: 50,
  },
  brand: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#D7B765',
    letterSpacing: 6,
  },
  heading: {
    fontSize: 31,
    fontWeight: '800',
    textAlign: 'center',
    color: '#D7B765',
    marginTop: 8,
  },
  subtitle: {
    color: '#EDE9DB',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 12,
  },
  panel: {
    backgroundColor: '#102B20',
    borderColor: '#B99748',
    borderWidth: 1,
    borderRadius: 16,
    padding: 22,
    marginTop: 55,
  },
  title: {
    color: '#D7B765',
    fontSize: 23,
    fontWeight: '700',
  },
  description: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 14,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#B99748',
    padding: 17,
    borderRadius: 10,
    marginTop: 26,
    alignItems: 'center',
  },
  buttonText: {
    color: '#071C15',
    fontWeight: '800',
    fontSize: 15,
  },
  note: {
    color: '#B8C4BB',
    marginTop: 30,
    textAlign: 'center',
    lineHeight: 21,
  },
});
