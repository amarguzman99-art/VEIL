import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, getNearby } from '../../src/api';

export default function Grid() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try { setUsers(await getNearby()); } catch (e) { console.log(e); }
    setLoading(false); setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>VEIL</Text>
            <View style={styles.dot} />
          </View>
          <TouchableOpacity testID="grid-premium-btn" style={styles.premiumBtn} onPress={() => router.push('/premium')}>
            <Ionicons name="diamond" size={14} color={theme.gold} />
            <Text style={styles.premiumText}>Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <ActivityIndicator size="large" color={theme.warm} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 100, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={theme.warm} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: theme.textSecondary }}>Aún no hay perfiles cercanos.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              testID={`user-card-${item.id}`}
              style={styles.card}
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
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.cardGradient} />
              <View style={styles.cardInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.onlineDot} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { color: theme.textPrimary, fontSize: 22, fontWeight: '300', letterSpacing: 6 },
  dot: { width: 6, height: 6, backgroundColor: theme.warm, borderRadius: 999 },
  premiumBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(212,175,55,0.1)', borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 },
  premiumText: { color: theme.gold, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  card: { flex: 1, aspectRatio: 3/4, borderRadius: 16, overflow: 'hidden', backgroundColor: theme.surface1 },
  cardImg: { width: '100%', height: '100%' },
  cardPlaceholder: { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' },
  cardGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },
  cardInfo: { position: 'absolute', bottom: 10, left: 12, right: 12 },
  cardName: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
  cardDist: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: '#4ADE80' },
});
