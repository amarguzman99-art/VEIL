import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { theme, getNearby, sendTap, tapsReceived } from '../../src/api';

const TAPS = [
  { type: 'flame', icon: '🔥', label: 'Fuego' },
  { type: 'heart', icon: '💜', label: 'Velo' },
  { type: 'kiss', icon: '💋', label: 'Beso' },
  { type: 'wave', icon: '👋', label: 'Saludo' },
  { type: 'drink', icon: '🍷', label: 'Copa' },
  { type: 'eye', icon: '👁️', label: 'Te veo' },
];

export default function TapZone() {
  const [users, setUsers] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = async () => {
    try {
      const [u, r] = await Promise.all([getNearby(), tapsReceived()]);
      setUsers(u.slice(0, 12)); setReceived(r);
    } catch {}
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const handleTap = async (userId: string, type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await sendTap(userId, type);
      if (res.is_match) {
        const target = users.find((u: any) => u.id === userId);
        router.push({ pathname: '/match', params: { name: target?.name || '', photo: target?.photo || '', userId } });
      } else {
        Alert.alert('✓ TAP enviado', 'Hemos lanzado tu señal. Si responde, lo sabrás.');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Intenta de nuevo');
    }
  };

  if (loading) return <View style={styles.container}><ActivityIndicator color={theme.cream} style={{ marginTop: 100 }} /></View>;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Zona TAP</Text>
          <Text style={styles.subtitle}>Rompe el hielo sin palabras · 🔥💜💋👋🍷👁️</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Received TAPs section */}
        {received.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>TE HAN DADO {received.length} TAP{received.length > 1 ? 'S' : ''}</Text>
              <Ionicons name="flame" size={14} color={theme.cream} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {received.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.recvCard}
                  onPress={() => t.locked ? router.push('/premium') : router.push(`/user/${t.from_user.id}`)}
                  activeOpacity={0.85}
                >
                  <View style={styles.recvImgWrap}>
                    {t.locked ? (
                      <View style={styles.lockedImg}>
                        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                        <Ionicons name="lock-closed" size={28} color={theme.cream} />
                      </View>
                    ) : t.from_user.photo ? (
                      <Image source={{ uri: t.from_user.photo }} style={styles.recvImg} />
                    ) : (
                      <View style={[styles.recvImg, { backgroundColor: theme.surface2 }]} />
                    )}
                    <View style={styles.recvBadge}>
                      <Text style={{ fontSize: 18 }}>{TAPS.find(x => x.type === t.tap_type)?.icon || '🔥'}</Text>
                    </View>
                  </View>
                  <Text style={styles.recvName} numberOfLines={1}>{t.locked ? '? ? ?' : t.from_user.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {received.some((t: any) => t.locked) && (
              <TouchableOpacity style={styles.unlockBtn} onPress={() => router.push('/premium')}>
                <LinearGradient colors={['#F5EBD6', '#E8D9B8', '#C9B68C']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.unlockBtnInner}>
                  <Ionicons name="diamond" size={14} color={theme.warmText} />
                  <Text style={styles.unlockBtnText}>Desbloquear todos los TAPs con Premium</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={[styles.sectionLabel, { marginLeft: 20, marginTop: 28, marginBottom: 10 }]}>GENTE CERCA · ENVÍA UN TAP</Text>
        {users.map((u) => (
          <View key={u.id} style={styles.userRow}>
            <TouchableOpacity style={styles.userInfo} onPress={() => router.push(`/user/${u.id}`)} activeOpacity={0.7}>
              {u.photo ? <Image source={{ uri: u.photo }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="person" size={28} color={theme.textSecondary} /></View>}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {u.is_online && <View style={styles.onlineDot} />}
                  <Text style={styles.userName}>{u.name}, {u.age}</Text>
                </View>
                {u.distance_km !== null && <Text style={styles.userDist}>{u.distance_km} km de ti</Text>}
              </View>
            </TouchableOpacity>
            <View style={styles.tapRow}>
              {TAPS.slice(0, 6).map((t) => (
                <TouchableOpacity key={t.type} testID={`tap-${u.id}-${t.type}`} style={styles.tapBtn} onPress={() => handleTap(u.id, t.type)} activeOpacity={0.7}>
                  <Text style={{ fontSize: 20 }}>{t.icon}</Text>
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
  subtitle: { color: theme.textSecondary, fontSize: 13, marginTop: 4 },
  section: { marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 12 },
  sectionLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  recvCard: { width: 100, alignItems: 'center' },
  recvImgWrap: { position: 'relative' },
  recvImg: { width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: theme.cream },
  lockedImg: { width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: theme.cream, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface3 },
  recvBadge: { position: 'absolute', right: -2, top: 50, backgroundColor: theme.surface1, borderRadius: 999, padding: 6, borderWidth: 1.5, borderColor: theme.cream },
  recvName: { color: theme.textPrimary, fontSize: 13, marginTop: 8, fontWeight: '500' },
  unlockBtn: { marginHorizontal: 16, marginTop: 18, borderRadius: 14, overflow: 'hidden' },
  unlockBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  unlockBtnText: { color: theme.warmText, fontSize: 14, fontWeight: '700' },
  userRow: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 999 },
  userName: { color: theme.textPrimary, fontSize: 16, fontWeight: '600' },
  userDist: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: theme.success },
  tapRow: { flexDirection: 'row', gap: 8, paddingLeft: 68, flexWrap: 'wrap' },
  tapBtn: { width: 46, height: 46, borderRadius: 999, backgroundColor: theme.surface1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
});
