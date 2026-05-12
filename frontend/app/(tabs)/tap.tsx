import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme, getNearby, sendTap, tapsReceived } from '../../src/api';

const TAPS = [
  { type: 'wave', icon: '👋', label: 'Saludo' },
  { type: 'flame', icon: '🔥', label: 'Fuego' },
  { type: 'drink', icon: '🍷', label: 'Copa' },
  { type: 'heart', icon: '💜', label: 'Velo' },
];

export default function TapZone() {
  const [users, setUsers] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async () => {
    try {
      const [u, r] = await Promise.all([getNearby(), tapsReceived()]);
      setUsers(u.slice(0, 10)); setReceived(r);
    } catch {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleTap = async (userId: string, type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await sendTap(userId, type);
      Alert.alert('✓ TAP enviado', 'Hemos lanzado tu señal.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Intenta de nuevo');
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator color={theme.warm} style={{ marginTop: 100 }} /></View>;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Zona TAP</Text>
          <Text style={styles.subtitle}>Rompe el hielo sin palabras</Text>
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {received.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TE HAN ENVIADO TAP</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {received.map((t) => (
                <TouchableOpacity key={t.id} style={styles.recvCard} onPress={() => router.push(`/user/${t.from_user.id}`)}>
                  {t.from_user.photo ? <Image source={{ uri: t.from_user.photo }} style={styles.recvImg} /> : <View style={[styles.recvImg, { backgroundColor: theme.surface2 }]} />}
                  <View style={styles.recvBadge}><Text style={{ fontSize: 18 }}>{TAPS.find(x => x.type === t.tap_type)?.icon || '👋'}</Text></View>
                  <Text style={styles.recvName} numberOfLines={1}>{t.from_user.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <Text style={[styles.sectionLabel, { marginLeft: 20, marginTop: 24 }]}>GENTE CERCA · ENVÍA UN TAP</Text>
        {users.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <TouchableOpacity style={styles.userInfo} onPress={() => router.push(`/user/${u.id}`)}>
              {u.photo ? <Image source={{ uri: u.photo }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="person" size={28} color={theme.textSecondary} /></View>}
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{u.name}, {u.age}</Text>
                {u.distance_km !== null && <Text style={styles.userDist}>{u.distance_km} km</Text>}
              </View>
            </TouchableOpacity>
            <View style={styles.tapRow}>
              {TAPS.map((t) => (
                <TouchableOpacity key={t.type} testID={`tap-${u.id}-${t.type}`} style={styles.tapBtn} onPress={() => handleTap(u.id, t.type)}>
                  <Text style={{ fontSize: 22 }}>{t.icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: -0.5 },
  subtitle: { color: theme.textSecondary, fontSize: 14, marginTop: 4 },
  section: { marginTop: 8 },
  sectionLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, paddingHorizontal: 20 },
  recvCard: { width: 100, alignItems: 'center' },
  recvImg: { width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: theme.warm },
  recvBadge: { position: 'absolute', right: 10, top: 50, backgroundColor: theme.surface1, borderRadius: 999, padding: 6, borderWidth: 1, borderColor: theme.warm },
  recvName: { color: theme.textPrimary, fontSize: 13, marginTop: 8 },
  userRow: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 999 },
  userName: { color: theme.textPrimary, fontSize: 16, fontWeight: '600' },
  userDist: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  tapRow: { flexDirection: 'row', gap: 10, paddingLeft: 68 },
  tapBtn: { width: 48, height: 48, borderRadius: 999, backgroundColor: theme.surface1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
});
