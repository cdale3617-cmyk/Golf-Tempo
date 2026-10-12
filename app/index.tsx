
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Section = 'HOME' | 'ROUND' | 'BAG' | 'LAB' | 'MORE';

type Club = {
  id: number;
  name: string;
  metres: number;
  loft: string;
};

const sections: Section[] = [
  'HOME', 'ROUND', 'BAG', 'LAB', 'MORE',
];

const starterClubs: Club[] = [
  { id: 1, name: 'Driver', metres: 200, loft: '10.5' },
  { id: 2, name: '7 Iron', metres: 135, loft: '30' },
  { id: 3, name: 'Pitching Wedge', metres: 95, loft: '45' },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<Section>('HOME');
  const [hole, setHole] = useState(1);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [clubs, setClubs] = useState<Club[]>(starterClubs);
  const [unit, setUnit] = useState<'m' | 'yd'>('m');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clubName, setClubName] = useState('');
  const [clubCarry, setClubCarry] = useState('');
  const [clubLoft, setClubLoft] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  const score = scores[hole] ?? 4;
  const total = Object.values(scores).reduce(
    (sum, value) => sum + value, 0
  );

  const distance = (metres: number) =>
    unit === 'm'
      ? Math.round(metres)
      : Math.round(metres * 1.0936133);

  function saveScore(value: number) {
    setScores(previous => ({
      ...previous,
      [hole]: Math.max(1, value),
    }));
  }

  function changeClub(id: number, amount: number) {
    const adjustment =
      unit === 'm' ? amount : amount / 1.0936133;

    setClubs(previous =>
      previous.map(club =>
        club.id === id
          ? {
              ...club,
              metres: Math.max(
                0,
                Math.round(club.metres + adjustment)
              ),
            }
          : club
      )
    );
  }

  function startAddClub() {
    if (clubs.length >= 14) {
      Alert.alert('Bag Full', 'Maximum 14 clubs.');
      return;
    }
    setEditingId(null);
    setClubName('');
    setClubCarry('');
    setClubLoft('');
    setShowEditor(true);
  }

  function startEditClub(club: Club) {
    setEditingId(club.id);
    setClubName(club.name);
    setClubCarry(String(distance(club.metres)));
    setClubLoft(club.loft);
    setShowEditor(true);
  }

  function saveClub() {
    const name = clubName.trim();
    const carry = Number(clubCarry);
    const loft = clubLoft.trim();
    const loftNumber = loft === '' ? null : Number(loft);

    if (
      !name ||
      clubCarry.trim() === '' ||
      !Number.isFinite(carry) ||
      carry < 0 ||
      (loftNumber !== null &&
        (!Number.isFinite(loftNumber) ||
          loftNumber < 0 ||
          loftNumber > 90))
    ) {
      Alert.alert(
        'Check Club',
        'Enter a valid club name, carry and loft.'
      );
      return;
    }

    if (
      clubs.some(
        c =>
          c.id !== editingId &&
          c.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      Alert.alert('Duplicate Club', 'That club already exists.');
      return;
    }

    const metres = Math.round(
      unit === 'm' ? carry : carry / 1.0936133
    );

    if (editingId !== null) {
      setClubs(previous =>
        previous.map(club =>
          club.id === editingId
            ? { ...club, name, metres, loft }
            : club
        )
      );
    } else {
      if (clubs.length >= 14) return;
      setClubs(previous => [
        ...previous,
        {
          id: Math.max(0, ...previous.map(c => c.id)) + 1,
          name,
          metres,
          loft,
        },
      ]);
    }
    setShowEditor(false);
  }

  function removeClub(id: number) {
    Alert.alert(
      'Remove Club',
      'Remove this club from your bag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            setClubs(previous =>
              previous.filter(club => club.id !== id)
            ),
        },
      ]
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 20) + 20 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
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

            <Pressable
              style={styles.secondary}
              onPress={() => setSection('BAG')}
            >
              <Text style={styles.buttonText}>MY BAG</Text>
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

            <Text style={[styles.copy, styles.total]}>
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

            <View style={styles.bagHeader}>
              <Text style={styles.copy}>
                {clubs.length} / 14 CLUBS
              </Text>
              <Pressable
                style={styles.unitButton}
                onPress={() =>
                  setUnit(previous =>
                    previous === 'm' ? 'yd' : 'm'
                  )
                }
              >
                <Text style={styles.primaryText}>
                  {unit === 'm' ? 'METRES' : 'YARDS'}
                </Text>
              </Pressable>
            </View>

            {clubs.map(club => (
              <View key={club.id} style={styles.clubCard}>
                <View style={styles.clubTop}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.loft}>
                    {club.loft ? `${club.loft}°` : '—'}
                  </Text>
                </View>

                <View style={styles.clubRow}>
                  <Pressable
                    onPress={() => changeClub(club.id, -5)}
                    style={styles.adjustButton}
                  >
                    <Text style={styles.adjust}>−</Text>
                  </Pressable>

                  <Text style={styles.distance}>
                    {distance(club.metres)} {unit}
                  </Text>

                  <Pressable
                    onPress={() => changeClub(club.id, 5)}
                    style={styles.adjustButton}
                  >
                    <Text style={styles.adjust}>+</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => startEditClub(club)}
                    style={styles.editButton}
                  >
                    <Text style={styles.buttonText}>EDIT</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => removeClub(club.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.buttonText}>X</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {clubs.length < 14 && !showEditor && (
              <Pressable
                style={styles.primary}
                onPress={startAddClub}
              >
                <Text style={styles.primaryText}>+ ADD CLUB</Text>
              </Pressable>
            )}

            {showEditor && (
              <View style={styles.editor}>
                <Text style={styles.title}>
                  {editingId === null ? 'Add Club' : 'Edit Club'}
                </Text>

                <Text style={styles.fieldLabel}>Club Name</Text>
                <TextInput
                  style={styles.input}
                  value={clubName}
                  onChangeText={setClubName}
                  placeholder="Example: 5 Iron"
                  placeholderTextColor="#AAB8AE"
                />

                <Text style={styles.fieldLabel}>
                  Carry Distance ({unit})
                </Text>
                <TextInput
                  style={styles.input}
                  value={clubCarry}
                  onChangeText={setClubCarry}
                  keyboardType="decimal-pad"
                  placeholder="150"
                  placeholderTextColor="#AAB8AE"
                />

                <Text style={styles.fieldLabel}>Loft (degrees)</Text>
                <TextInput
                  style={styles.input}
                  value={clubLoft}
                  onChangeText={setClubLoft}
                  keyboardType="decimal-pad"
                  placeholder="28"
                  placeholderTextColor="#AAB8AE"
                />

                <Pressable
                  style={styles.primary}
                  onPress={saveClub}
                >
                  <Text style={styles.primaryText}>SAVE CLUB</Text>
                </Pressable>

                <Pressable
                  style={styles.secondary}
                  onPress={() => setShowEditor(false)}
                >
                  <Text style={styles.buttonText}>CANCEL</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.note}>
              Club changes are temporary until permanent storage is connected.
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
            <Text style={styles.copy}>DRC Golf Tempo</Text>
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

      <View
        style={[
          styles.nav,
          { paddingBottom: Math.max(insets.bottom, 12) + 8 },
        ]}
      >
        {sections.map(item => (
          <Pressable
            key={item}
            onPress={() => {
              setShowEditor(false);
              setSection(item);
            }}
            style={[
              styles.navItem,
              section === item && styles.active,
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.navText,
                section === item && styles.activeText,
              ]}
            >
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
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
    textAlign: 'center',
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
    textAlign: 'center',
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
  total: {
    marginTop: 18,
  },
  bagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitButton: {
    backgroundColor: '#D7B765',
    padding: 10,
    borderRadius: 8,
  },
  clubCard: {
    backgroundColor: '#17382A',
    borderColor: '#355547',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  clubTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clubName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  loft: {
    color: '#D7B765',
    fontSize: 15,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  adjustButton: {
    width: 32,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjust: {
    color: '#D7B765',
    fontSize: 26,
  },
  distance: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    minWidth: 65,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#214637',
    padding: 9,
    borderRadius: 7,
  },
  removeButton: {
    backgroundColor: '#63302C',
    padding: 9,
    borderRadius: 7,
  },
  editor: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#B99748',
    paddingTop: 20,
  },
  fieldLabel: {
    color: '#D7B765',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    color: '#FFFFFF',
    backgroundColor: '#17382A',
    borderWidth: 1,
    borderColor: '#B99748',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  nav: {
    flexDirection: 'row',
    backgroundColor: '#102B20',
    borderTopWidth: 1,
    borderTopColor: '#B99748',
    paddingTop: 12,
    paddingHorizontal: 5,
    minHeight: 65,
  },
  navItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
  activeText: {
    color: '#D7B765',
  },
});
