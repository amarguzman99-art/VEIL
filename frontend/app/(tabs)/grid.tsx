import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, getNearby, tapsCount } from '../../src/api';

export default function Grid() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tapNum, setTapNum] = useState(0);
  const router = useRouter();

  const load = async () => {
    try {
      const [u, t] = await Promise.all([getNearby(), tapsCount()]);
      setUsers(u); setTapNum(t.count || 0);
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
          <TouchableOpacity testID="grid-premium-btn" style={styles.premiumBtn} onPress={() => router.push('/premium')}>
            <Ionicons name="diamond" size={13} color={theme.cream} />
            <Text style={styles.premiumText}>Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Activity banner */}
        {!loading && (
          <View style={styles.activityBar}>
            <View style={styles.pulse} />
            <Text style={styles.activityText}>
              <Text style={styles.activityNum}>{onlineCount}</Text> en línea ahora
            </Text>
            <View style={styles.divider} />
            <Ionicons name="flame" size={13} color={theme.cream} />
            <Text style={styles.activityText}>
              <Text style={styles.activityNum}>{tapNum}</Text> taps recibidos
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
          numColumns={2}
          columnWrapperStyle={{ gap: 10, paddingHorizontal: 14 }}
          contentContainerStyle={{ gap: 10, paddingBottom: 100, paddingTop: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.cream} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Aún no hay perfiles cercanos.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`user-card-${item.id}`}
              style={[styles.card, item.is_boosted && styles.cardBoosted]}
              activeOpacity={0.85}
              onPress={() => router.push(`/user/${item.id}`)}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.cardImg} />
              ) : (
                <View style={[styles.cardImg, styles.cardPlaceholder]}>
                  <Ionicons name="person" size={48} color={theme.textSecondary} />
                </View>
              )}
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.92)']} locations={[0.4, 1]} style={styles.cardGradient} />
              {item.is_boosted && (
                <View style={styles.boostBadge}>
                  <Ionicons name="flash" size={10} color={theme.warmText} />
                  <Text style={styles.boostText}>BOOST</Text>
                </View>
              )}
              {item.is_premium && (
                <View style={styles.premiumDot}>
                  <Ionicons name="diamond" size={11} color={theme.cream} />
                </View>
              )}
              <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { color: theme.textPrimary, fontSize: 22, fontWeight: '300', letterSpacing: 7 },
  dot: { width: 6, height: 6, backgroundColor: theme.cream, borderRadius: 999 },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(232,217,184,0.10)', borderColor: 'rgba(232,217,184,0.4)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  premiumText: { color: theme.cream, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activityBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingBottom: 12, paddingTop: 2 },
  pulse: { width: 8, height: 8, borderRadius: 999, backgroundColor: theme.success },
  activityText: { color: theme.textSecondary, fontSize: 12 },
  activityNum: { color: theme.textPrimary, fontWeight: '700' },
  divider: { width: 1, height: 12, backgroundColor: theme.border, marginHorizontal: 4 },
  card: { flex: 1, aspectRatio: 3/4, borderRadius: 18, overflow: 'hidden', backgroundColor: theme.surface1, position: 'relative' },
  cardBoosted: { borderWidth: 1.5, borderColor: theme.cream },
  cardImg: { width: '100%', height: '100%' },
  cardPlaceholder: { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' },
  cardGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 },
  cardInfo: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  cardName: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
  cardDist: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: theme.success },
  offlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: theme.textMuted },
  boostBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.cream, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },
  boostText: { color: theme.warmText, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  premiumDot: { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: theme.cream },
});
