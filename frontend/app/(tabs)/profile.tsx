import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, me, updateProfile, clearAuth, deleteAccount } from '../../src/api';

const INTERESTS_POOL = ['☕ Café', '📖 Libros', '🎬 Cine', '🎵 Música', '✈️ Viajes', '💪 Gym', '🏛️ Arte', '📐 Diseño', '🌃 Noche', '🍽️ Cocina', '🍷 Vinos', '🌱 Jardín', '🏃 Running', '📸 Foto', '🐕 Perros', '💻 Tech', '🎮 Gaming', '🍕 Pizza', '🧘 Yoga', '🌿 Naturaleza', '📚 Lectura', '🎨 Diseño', '🎸 Música', '📀 Vinilo'];

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await me();
      setUser(u); setName(u.name); setBio(u.bio); setInterests(u.interests || []);
    })();
  }, []));

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ name, bio, interests });
      setUser({ ...user, ...updated });
      setEditing(false);
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.detail || 'No se pudo guardar'); }
    setSaving(false);
  };

  const toggleInterest = (i: string) => {
    setInterests(interests.includes(i) ? interests.filter(x => x !== i) : [...interests, i].slice(0, 8));
  };

  const logout = async () => {
    Alert.alert('Cerrar sesión', '¿Seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/(auth)/welcome'); } },
    ]);
  };

  const handleDelete = async () => {
    Alert.alert('Eliminar cuenta', 'Esta acción es permanente. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await deleteAccount(); await clearAuth(); router.replace('/(auth)/welcome'); }
        catch { Alert.alert('Error', 'No se pudo eliminar'); }
      }},
    ]);
  };

  if (!user) return <View style={styles.container}><ActivityIndicator color={theme.warm} style={{ marginTop: 100 }} /></View>;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mi perfil</Text>
            {!editing && <TouchableOpacity testID="profile-edit-btn" onPress={() => setEditing(true)}><Ionicons name="create-outline" size={24} color={theme.warm} /></TouchableOpacity>}
          </View>
        </SafeAreaView>

        <View style={styles.card}>
          <View style={styles.avatarWrap}>
            {user.photo ? <Image source={{ uri: user.photo }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="person" size={48} color={theme.textSecondary} /></View>}
          </View>
          {editing ? (
            <>
              <Text style={styles.label}>NOMBRE</Text>
              <TextInput testID="profile-name-input" style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.textSecondary} />
              <Text style={styles.label}>SOBRE TI</Text>
              <TextInput testID="profile-bio-input" style={[styles.input, { height: 90, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} multiline maxLength={300} placeholderTextColor={theme.textSecondary} />
              <Text style={styles.label}>INTERESES ({interests.length}/8)</Text>
              <View style={styles.tags}>
                {INTERESTS_POOL.map(i => (
                  <TouchableOpacity key={i} onPress={() => toggleInterest(i)} style={[styles.tag, interests.includes(i) && styles.tagOn]}>
                    <Text style={[styles.tagText, interests.includes(i) && styles.tagTextOn]}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity style={[styles.btnGhost, { flex: 1 }]} onPress={() => setEditing(false)}><Text style={styles.btnGhostText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity testID="profile-save-btn" style={[styles.btn, { flex: 1 }]} onPress={save} disabled={saving}>
                  {saving ? <ActivityIndicator color={theme.warmText} /> : <Text style={styles.btnText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.name}>{user.name}, {user.age}</Text>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : <Text style={[styles.bio, { fontStyle: 'italic' }]}>Sin descripción aún.</Text>}
              {interests.length > 0 && (
                <View style={[styles.tags, { marginTop: 16 }]}>
                  {interests.map(i => <View key={i} style={styles.tag}><Text style={styles.tagText}>{i}</Text></View>)}
                </View>
              )}
            </>
          )}
        </View>

        {!editing && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/premium')}>
              <Ionicons name="diamond" size={20} color={theme.cream} />
              <Text style={[styles.menuText, { color: theme.cream }]}>VEIL Premium</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-safety-btn" style={styles.menuItem} onPress={() => router.push('/legal/safety')}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.success} />
              <Text style={styles.menuText}>Centro de Seguridad</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-community-btn" style={styles.menuItem} onPress={() => router.push('/legal/community')}>
              <Ionicons name="people-outline" size={20} color={theme.textPrimary} />
              <Text style={styles.menuText}>Normas de Comunidad</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-privacy-btn" style={styles.menuItem} onPress={() => router.push('/legal/privacy')}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textPrimary} />
              <Text style={styles.menuText}>Política de Privacidad</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-terms-btn" style={styles.menuItem} onPress={() => router.push('/legal/terms')}>
              <Ionicons name="document-text-outline" size={20} color={theme.textPrimary} />
              <Text style={styles.menuText}>Términos de Servicio</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-logout-btn" style={styles.menuItem} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color={theme.textPrimary} />
              <Text style={styles.menuText}>Cerrar sesión</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity testID="profile-delete-btn" style={styles.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
              <Text style={[styles.menuText, { color: theme.danger }]}>Eliminar mi cuenta</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { color: theme.textPrimary, fontSize: 28, fontWeight: '300' },
  card: { backgroundColor: theme.surface1, marginHorizontal: 16, borderRadius: 24, padding: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 110, height: 110, borderRadius: 999 },
  name: { color: theme.textPrimary, fontSize: 24, fontWeight: '500', textAlign: 'center' },
  bio: { color: theme.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  label: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: theme.surface2, borderRadius: 12, padding: 14, color: theme.textPrimary, fontSize: 15 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: theme.surface2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: theme.border },
  tagOn: { backgroundColor: theme.warm, borderColor: theme.warm },
  tagText: { color: theme.textPrimary, fontSize: 13 },
  tagTextOn: { color: theme.warmText, fontWeight: '600' },
  btn: { backgroundColor: theme.warm, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: theme.warmText, fontWeight: '600' },
  btnGhost: { backgroundColor: theme.surface2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnGhostText: { color: theme.textPrimary, fontWeight: '500' },
  menu: { marginHorizontal: 16, marginTop: 24, backgroundColor: theme.surface1, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  menuText: { color: theme.textPrimary, fontSize: 15, flex: 1 },
});
