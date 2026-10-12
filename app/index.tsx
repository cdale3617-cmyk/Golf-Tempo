
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';

type Section = 'HOME' | 'ROUND' | 'BAG' | 'LAB' | 'MORE';

const sections: Section[] = [
  'HOME', 'ROUND', 'BAG', 'LAB', 'MORE',
];

const starterClubs = [
  { name: 'Driver', metres: 200 },
  { name: '7 Iron', metres: 135 },
  { name: 'Pitching Wedge', metres: 95 },
];

export default function Home() {
  const [section, setSection] = useState<Section>('HOME');
  const [hole, setHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [clubs, setClubs] = useState(starterClubs);

  const score = scores[hole] ?? 4;
  const total = Object.values(scores).reduce(
    (sum, value) => sum + value, 0
  );

  function saveScore(value: number) {
    setScores(previous => ({
      ...previous,
      [hole]: Math.max(1, value),
    }));
  }

  function changeClub(index: number, amount: number) {
    setClubs(previous => previous.map((club, i) =>
      i === index
        ? { ...club, metres: Math.max(0, club.metres + amount) }
        : club
    ));
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>DRC</Text>
        <Text style={styles.heading}>GOLF TEMPO</Text>
        <Text style={styles.subtitle}>{section}</Text>

        {section === 'HOME' && (
          <View style={styles.panel}>
            <Text style={styles.title}>Golf Dashboard</Text>
            <Text style={styles.copy}>
              Swing practice, scorecard and golf tools.
            </Text>
            <Link href="/record" asChild>
              <Pressable style={styles.primary}>
                <Text style={styles.primaryText}>
                  OPEN SWING MONITOR
                </Text>
              </Pressable>
            </Link>
            <Pressable
              style={styles.secondary}
              onPress={() => setSection('ROUND')}
            >
              <Text style={styles.buttonText}>
                OPEN SCORECARD
              </Text>
            </Pressable>
          </View>
        )}

        {section === 'ROUND' && (
          <View style={styles.panel}>
            <Text style={styles.title}>Scorecard</Text>
            <Text style={styles.copy}>Hole {hole} of 18</Text>
            <View style={styles.controls}>
              <Pressable
                style={styles.smallButton}
                onPress={() => setHole(h => Math.max(1, h - 1))}
              >
                <Text style={styles.buttonText}>PREV</Text>
              </Pressable>
              <Text style={styles.value}>{score}</Text>
              <Pressable
                style={styles.smallButton}
                onPress={() => setHole(h => Math.min(18, h + 1))}
              >
                <Text style={styles.buttonText}>NEXT</Text>
              </Pressable>
            </View>
            <View style={styles.controls}>
              <Pressable
                style={styles.smallButton}
                onPress={() => saveScore(score - 1)}
              >
                <Text style={styles.buttonText}>- STROKE</Text>
              </Pressable>
              <Pressable
                style={styles.smallButton}
                onPress={() => saveScore(score + 1)}
              >
                <Text style={styles.buttonText}>+ STROKE</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.primary}
              onPress={() => {
                saveScore(score);
                setHole(h => Math.min(18, h + 1));
              }}
            >
              <Text style={styles.primaryText}>
                SAVE HOLE / NEXT
              </Text>
            </Pressable>
            <Text style={styles.copy}>
              Recorded total: {total} strokes
            </Text>
            <Text style={styles.note}>
              Scores are temporary until permanent storage is added.
            </Text>
          </View>
        )}

        {section === 'BAG' && (
          <View style={styles.panel}>
            <Text style={styles.title}>My Bag</Text>
            <Text style={styles.copy}>
              Adjust carry distances in metres.
            </Text>
            {clubs.map((club, index) => (
              <View key={club.name} style={styles.clubRow}>
                <Text style={styles.clubName}>{club.name}</Text>
                <Pressable onPress={() => changeClub(index, -5)}>
                  <Text style={styles.adjust}>-</Text>
                </Pressable>
                <Text style={styles.distance}>
                  {club.metres} m
                </Text>
                <Pressable onPress={() => changeClub(index, 5)}>
                  <Text style={styles.adjust}>+</Text>
                </Pressable>
              </View>
            ))}
            <Text style={styles.note}>
              Sample clubs. Changes are temporary.
            </Text>
          </View>
        )}

        {section === 'LAB' && (
          <View style={styles.panel}>
            <Text style={styles.title}>Golf Lab</Text>
            <Text style={styles.copy}>
              Record, select and play swing videos.
            </Text>
            <Link href="/record" asChild>
              <Pressable style={styles.primary}>
                <Text style={styles.primaryText}>
                  OPEN SWING MONITOR
                </Text>
              </Pressable>
            </Link>
            <Text style={styles.note}>
              Additional analysis modules will be restored separately.
            </Text>
          </View>
        )}

        {section === 'MORE' && (
          <View style={styles.panel}>
            <Text style={styles.title}>More</Text>
            <Text style={styles.copy}>
              DRC Golf Tempo
            </Text>
            <Text style={styles.copy}>
              Home, Round, Bag, Lab and More navigation.
            </Text>
            <Text style={styles.note}>
              GPS, course maps, biometrics and advanced analysis
              are not yet connected.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.nav}>
        {sections.map(item => (
          <Pressable
            key={item}
            onPress={() => setSection(item)}
            style={[
              styles.navItem,
              section === item && styles.active,
            ]}
          >
            <Text style={[
              styles.navText,
              section === item && styles.activeText,
            ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071C15',
  },
  content: {
    padding: 18,
    paddingTop: 55,
    paddingBottom: 30,
  },
  brand: {
    color: '#D7B765',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 5,
  },
  heading: {
    color: '#D7B765',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: '#EDE9DB',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 10,
  },
  panel: {
    marginTop: 30,
    padding: 18,
    backgroundColor: '#102B20',
    borderColor: '#B99748',
    borderWidth: 1,
    borderRadius: 16,
  },
  title: {
    color: '#D7B765',
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 12,
  },
  copy: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 14,
  },
  note: {
    color: '#B8C4BB',
    marginTop: 18,
    lineHeight: 21,
  },
  primary: {
    backgroundColor: '#B99748',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryText: {
    color: '#071C15',
    fontWeight: '800',
  },
  secondary: {
    backgroundColor: '#214637',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  smallButton: {
    backgroundColor: '#214637',
    padding: 12,
    borderRadius: 8,
  },
  value: {
    color: '#D7B765',
    fontSize: 28,
    fontWeight: '800',
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#355547',
  },
  clubName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
  },
  adjust: {
    color: '#D7B765',
    fontSize: 26,
    paddingHorizontal: 10,
  },
  distance: {
    color: '#FFFFFF',
    minWidth: 60,
    textAlign: 'center',
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#102B20',
    borderTopWidth: 1,
    borderTopColor: '#B99748',
    paddingBottom: 12,
    paddingTop: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
  },
  active: {
    borderBottomWidth: 2,
    borderBottomColor: '#D7B765',
  },
  navText: {
    color: '#B8C4BB',
    fontSize: 10,
    fontWeight: '700',
  },
  active: {
    borderBottomWidth: 2,
    borderBottomColor: '#D7B765',
  },
  activeText: {
    color: '#D7B765',
  },
});
