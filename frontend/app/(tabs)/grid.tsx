import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, getNearby, tapsCount, dailyPicks } from '../../src/api';

const { width } = Dimensions.get('window');
const COLS = 3;
const GAP = 6;
const CARD_W = (width - GAP * (COLS + 1)) / COLS;

export default function Grid() {
  const [users, setUsers] = useState<any[]>([]);
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tapNum, setTapNum] = useState(0);
  const router = useRouter();

  const load = async () => {
    try {
      const [u, t, p] = await Promise.all([getNearby(), tapsCount(), dailyPicks()]);
      setUsers(u); setTapNum(t.count || 0); setPicks(p);
    } catch (e) { console.log(e); }
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onlineCount = users.filter(u => u.is_online).length;

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>VEIL</Text>
            <View style={styles.dot} />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity testID="grid-filter-btn" style={styles.iconBtn} onPress={() => router.push('/premium')}>
              <Ionicons name="options" size={18} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity testID="grid-premium-btn" style={styles.premiumBtn} onPress={() => router.push('/premium')}>
              <Ionicons name="diamond" size={13} color={theme.cream} />
              <Text style={styles.premiumText}>Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!loading && (
          <View style={styles.activityBar}>
            <View style={styles.pulse} />
            <Text style={styles.activityText}>
              <Text style={styles.activityNum}>{onlineCount}</Text> en línea
            </Text>
            <View style={styles.divider} />
            <Text style={styles.activityText}>
              <Text style={styles.activityNum}>{users.length}</Text> cerca
            </Text>
            <View style={styles.divider} />
            <Ionicons name="flame" size={12} color={theme.cream} />
            <Text style={styles.activityText}>
              <Text style={styles.activityNum}>{tapNum}</Text> taps
            </Text>
          </View>
        )}
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color={theme.cream} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          columnWrapperStyle={{ gap: GAP, paddingHorizontal: GAP }}
          contentContainerStyle={{ gap: GAP, paddingBottom: 100, paddingTop: 4 }}
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.cream} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListHeaderComponent={picks.length > 0 ? (
            <View style={styles.picksSection}>
              <View style={styles.picksHeader}>
                <Ionicons name="sparkles" size={14} color={theme.cream} />
                <Text style={styles.picksTitle}>Sugerencias para ti</Text>
                <Text style={styles.picksDate}>Hoy</Text>
              </View>
              <FlatList
                horizontal
                data={picks}
                keyExtractor={(it) => 'pick-' + it.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.pickCard} onPress={() => router.push(`/user/${item.id}`)} activeOpacity={0.85}>
                    <Image source={{ uri: item.photo }} style={styles.pickImg} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.95)']} locations={[0.4, 1]} style={StyleSheet.absoluteFill} />
                    {item.verified && <View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={16} color={theme.blueArrow} /></View>}
                    <View style={styles.pickInfo}>
                      <Text style={styles.pickName} numberOfLines={1}>{item.name}, {item.age}</Text>
                      {item.interests?.length > 0 && (
                        <Text style={styles.pickInterest} numberOfLines={1}>{item.interests[0]}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
              <View style={styles.gridLabel}>
                <Text style={styles.gridLabelText}>CERCA DE TI · {users.length}</Text>
              </View>
            </View>
          ) : null}
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`user-card-${item.id}`}
              style={[styles.card, { width: CARD_W, height: CARD_W * 1.25 }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/user/${item.id}`)}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.cardImg} />
              ) : (
                <View style={[styles.cardImg, styles.cardPlaceholder]}>
                  <Ionicons name="person" size={32} color={theme.textSecondary} />
                </View>
              )}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} locations={[0.45, 1]} style={styles.cardGradient} />
              {item.is_boosted && (
                <View style={styles.boostBadge}>
                  <Ionicons name="flash" size={9} color={theme.warmText} />
                </View>
              )}
              {item.verified && (
                <View style={styles.verifiedDot}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.blueArrow} />
                </View>
              )}
              {item.is_premium && !item.verified && (
                <View style={styles.premiumDot}>
                  <Ionicons name="diamond" size={9} color={theme.cream} />
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {item.is_online ? <View style={styles.onlineDot} /> : <View style={styles.offlineDot} />}
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}, {item.age}</Text>
                </View>
                {item.distance_km !== null && (
                  <Text style={styles.cardDist}>{item.distance_km} km</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logo: { color: theme.textPrimary, fontSize: 22, fontWeight: '300', letterSpacing: 7 },
  dot: { width: 6, height: 6, backgroundColor: theme.cream, borderRadius: 999 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: theme.surface1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(232,217,184,0.10)', borderColor: 'rgba(232,217,184,0.4)', borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 },
  premiumText: { color: theme.cream, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  activityBar: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingBottom: 8 },
  pulse: { width: 7, height: 7, borderRadius: 999, backgroundColor: theme.success },
  activityText: { color: theme.textSecondary, fontSize: 11 },
  activityNum: { color: theme.textPrimary, fontWeight: '700' },
  divider: { width: 1, height: 10, backgroundColor: theme.border, marginHorizontal: 2 },
  card: { borderRadius: 10, overflow: 'hidden', backgroundColor: theme.surface1, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  cardPlaceholder: { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' },
  cardGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
  cardInfo: { position: 'absolute', bottom: 6, left: 7, right: 7 },
  cardName: { color: theme.textPrimary, fontSize: 12, fontWeight: '600' },
  cardDist: { color: theme.textSecondary, fontSize: 10, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: theme.success },
  offlineDot: { width: 6, height: 6, borderRadius: 999, backgroundColor: theme.textMuted },
  boostBadge: { position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: 999, backgroundColor: theme.cream, alignItems: 'center', justifyContent: 'center' },
  premiumDot: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: theme.cream },
  verifiedDot: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  picksSection: { marginBottom: 14 },
  picksHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
  picksTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  picksDate: { color: theme.cream, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  pickCard: { width: 140, height: 180, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  pickImg: { width: '100%', height: '100%' },
  pickInfo: { position: 'absolute', bottom: 8, left: 10, right: 10 },
  pickName: { color: theme.textPrimary, fontSize: 14, fontWeight: '600' },
  pickInterest: { color: theme.cream, fontSize: 11, marginTop: 2 },
  verifiedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 999, padding: 2 },
  gridLabel: { paddingHorizontal: 16, marginTop: 18, marginBottom: 4 },
  gridLabelText: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
});
