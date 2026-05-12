import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getUser, blockUser, reportUser } from '../../src/api';

export default function UserDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => { (async () => { try { setUser(await getUser(id)); } catch {} })(); }, [id]);

  const onMore = () => {
    Alert.alert('Opciones', '', [
      { text: 'Reportar', onPress: () => {
        Alert.alert('Reportar a ' + user.name, '¿Cuál es el motivo?', [
          { text: 'Acoso o abuso', onPress: async () => { await reportUser(id, 'harassment'); Alert.alert('✓', 'Gracias. Revisaremos en 24h.'); } },
          { text: 'Suplantación / Fake', onPress: async () => { await reportUser(id, 'fake_profile'); Alert.alert('✓', 'Gracias. Revisaremos en 24h.'); } },
          { text: 'Contenido sexual explícito', onPress: async () => { await reportUser(id, 'explicit_content'); Alert.alert('✓', 'Gracias. Revisaremos en 24h.'); } },
          { text: 'Spam / Comercial', onPress: async () => { await reportUser(id, 'spam'); Alert.alert('✓', 'Gracias. Revisaremos en 24h.'); } },
          { text: 'Menor de edad', onPress: async () => { await reportUser(id, 'minor'); Alert.alert('✓', 'Gracias. Acción prioritaria.'); } },
          { text: 'Otro', onPress: async () => { await reportUser(id, 'other'); Alert.alert('✓', 'Gracias. Revisaremos en 24h.'); } },
          { text: 'Cancelar', style: 'cancel' },
        ]);
      }},
      { text: 'Bloquear', style: 'destructive', onPress: () => {
        Alert.alert('Bloquear a ' + user.name, 'No volverás a ver a esta persona ni recibir mensajes suyos.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Bloquear', style: 'destructive', onPress: async () => { await blockUser(id); Alert.alert('✓', 'Usuario bloqueado.'); router.back(); } },
        ]);
      }},
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (!user) return <View style={styles.container}><ActivityIndicator color={theme.warm} style={{ marginTop: 100 }} /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          {user.photo ? <Image source={{ uri: user.photo }} style={styles.heroImg} /> : <View style={[styles.heroImg, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="person" size={80} color={theme.textSecondary} /></View>}
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', theme.bg]} locations={[0, 0.3, 1]} style={styles.heroGrad} />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <TouchableOpacity testID="detail-back-btn" onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity testID="detail-more-btn" onPress={onMore} style={styles.navBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          {user.distance_km !== null && (
            <View style={styles.distRow}>
              <Ionicons name="location" size={14} color={theme.warm} />
              <Text style={styles.dist}>{user.distance_km} km de ti</Text>
            </View>
          )}
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          {user.interests?.length > 0 && (
            <>
              <Text style={styles.section}>INTERESES</Text>
              <View style={styles.tags}>
                {user.interests.map((i: string) => <View key={i} style={styles.tag}><Text style={styles.tagText}>{i}</Text></View>)}
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomBar}>
        <TouchableOpacity testID="detail-chat-btn" style={styles.chatBtn} onPress={() => router.push(`/chat/${user.id}`)}>
          <Ionicons name="chatbubble" size={18} color={theme.warmText} />
          <Text style={styles.chatBtnText}>Chat gratis</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="detail-tap-btn" style={styles.tapBtn} onPress={() => router.push('/(tabs)/tap')}>
          <Ionicons name="flash" size={20} color={theme.warm} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  hero: { height: 480, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroGrad: { ...StyleSheet.absoluteFillObject },
  heroNav: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  navBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: 'rgba(11,8,17,0.5)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 24, marginTop: -60 },
  name: { color: theme.textPrimary, fontSize: 34, fontWeight: '400', letterSpacing: -1 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  dist: { color: theme.textSecondary, fontSize: 14 },
  bio: { color: theme.textPrimary, fontSize: 16, lineHeight: 24, marginTop: 20 },
  section: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginTop: 28, marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: theme.surface1, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: theme.border },
  tagText: { color: theme.textPrimary, fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 32, flexDirection: 'row', gap: 12, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.warm, paddingVertical: 16, borderRadius: 24 },
  chatBtnText: { color: theme.warmText, fontSize: 16, fontWeight: '600' },
  tapBtn: { width: 56, height: 56, borderRadius: 999, backgroundColor: theme.surface1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
});
