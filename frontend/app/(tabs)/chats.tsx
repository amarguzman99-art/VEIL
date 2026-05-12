import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, listConversations } from '../../src/api';

export default function Chats() {
  const [convs, setConvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    (async () => {
      try { setConvs(await listConversations()); } catch {}
      setLoading(false);
    })();
  }, []));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Mensajes</Text>
        </View>
      </SafeAreaView>
      {loading ? (
        <ActivityIndicator color={theme.warm} style={{ marginTop: 60 }} />
      ) : convs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={56} color={theme.textSecondary} />
          <Text style={styles.emptyTitle}>Aún no tienes conversaciones</Text>
          <Text style={styles.emptySub}>Descubre gente cerca y rompe el hielo.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/grid')}>
            <Text style={styles.emptyBtnText}>Explorar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={convs}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity testID={`chat-row-${item.user.id}`} style={styles.row} onPress={() => router.push(`/chat/${item.user.id}`)}>
              {item.user.photo ? (
                <Image source={{ uri: item.user.photo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="person" size={26} color={theme.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.user.name}</Text>
                <Text style={styles.last} numberOfLines={1}>{item.last_message}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: -0.5 },
  empty: { padding: 40, alignItems: 'center', marginTop: 60 },
  emptyTitle: { color: theme.textPrimary, fontSize: 18, marginTop: 16 },
  emptySub: { color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' },
  emptyBtn: { backgroundColor: theme.warm, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 999, marginTop: 24 },
  emptyBtnText: { color: theme.warmText, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  avatar: { width: 56, height: 56, borderRadius: 999 },
  name: { color: theme.textPrimary, fontSize: 16, fontWeight: '600' },
  last: { color: theme.textSecondary, fontSize: 14, marginTop: 4 },
});
