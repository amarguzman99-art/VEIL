import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme, me, updateProfile, clearAuth, deleteAccount } from '../../src/api';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 40 - 16) / 3;

const INTEREST_GROUPS = [
  { title: 'Estilo de vida', items: ['☕ Café', '🍷 Vinos', '🥃 Cócteles', '🍽️ Cocina', '🌱 Vegano', '💪 Gym', '🏃 Running', '🧘 Yoga', '🚴 Ciclismo', '🏊 Natación', '⚽ Fútbol', '🎾 Tenis'] },
  { title: 'Cultura', items: ['📖 Libros', '🎬 Cine', '🎭 Teatro', '🎨 Arte', '📐 Diseño', '🏛️ Museos', '📷 Foto', '📺 Series', '📰 Noticias'] },
  { title: 'Música', items: ['🎵 Pop', '🎸 Rock', '🎧 Electrónica', '🎤 Indie', '🪩 Disco', '🎼 Clásica', '🎷 Jazz', '💃 Reggaetón', '🪕 Country'] },
  { title: 'Viajes & Aventura', items: ['✈️ Viajes', '🏔️ Montaña', '🌊 Mar', '🏖️ Playa', '🎒 Mochilero', '🚗 Road trip', '🏕️ Camping'] },
  { title: 'Vida nocturna', items: ['🌃 Noche', '🍸 Bares', '🪩 Clubbing', '🎉 Fiestas', '🎰 Casino', '🥳 Eventos'] },
  { title: 'Hogar & Personal', items: ['🐕 Perros', '🐈 Gatos', '🌿 Plantas', '🎮 Gaming', '🧩 Puzzles', '🛍️ Moda', '💇 Estilo', '🛋️ Hogar'] },
  { title: 'Profesional', items: ['💼 Negocios', '💻 Tech', '🎓 Estudiante', '🧪 Ciencia', '⚖️ Ley', '🩺 Salud', '🎬 Creativo'] },
  { title: 'Conexión', items: ['💜 Romance', '🤝 Amistad', '☕ Café & charla', '🍿 Netflix & chill', '🚶 Paseos', '🎯 Citas reales'] },
];

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await me();
      setUser(u); setName(u.name); setBio(u.bio); setInterests(u.interests || []); setPhotos(u.photos || []);
    })();
  }, []));

  const pickPhoto = async (slot: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [3, 4], quality: 0.5, base64: true,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const base64Uri = `data:image/jpeg;base64,${res.assets[0].base64}`;
    const next = [...photos];
    next[slot] = base64Uri;
    setPhotos(next.filter(Boolean));
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaving(true);
    try {
      const cleanPhotos = photos.filter(Boolean).slice(0, 6);
      const updated = await updateProfile({ name, bio, interests, photos: cleanPhotos });
      setUser({ ...user, ...updated });
      setEditing(false);
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.detail || 'No se pudo guardar'); }
    setSaving(false);
  };

  const toggleInterest = (i: string) => {
    setInterests(interests.includes(i) ? interests.filter(x => x !== i) : [...interests, i].slice(0, 12));
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

  if (!user) return <View style={styles.container}><ActivityIndicator color={theme.cream} style={{ marginTop: 100 }} /></View>;

  const displayPhoto = photos[0] || user.photo;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Mi perfil</Text>
            {!editing && <TouchableOpacity testID="profile-edit-btn" onPress={() => setEditing(true)}><Ionicons name="create-outline" size={24} color={theme.cream} /></TouchableOpacity>}
          </View>
        </SafeAreaView>

        <View style={styles.card}>
          {editing ? (
            <>
              <Text style={styles.label}>FOTOS ({photos.length}/6)</Text>
              <View style={styles.photoGrid}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const photo = photos[i];
                  return (
                    <TouchableOpacity
                      key={i}
                      testID={`photo-slot-${i}`}
                      style={[styles.photoSlot, { width: PHOTO_SIZE, height: PHOTO_SIZE * 1.25 }]}
                      onPress={() => photo ? Alert.alert('Foto', '', [
                        { text: 'Eliminar', style: 'destructive', onPress: () => removePhoto(i) },
                        { text: 'Cancelar', style: 'cancel' },
                      ]) : pickPhoto(i)}
                      activeOpacity={0.7}
                    >
                      {photo ? (
                        <>
                          <Image source={{ uri: photo }} style={styles.photoImg} />
                          {i === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>PRINCIPAL</Text></View>}
                          <View style={styles.photoOverlay}>
                            <Ionicons name="close-circle" size={22} color={theme.cream} />
                          </View>
                        </>
                      ) : (
                        <View style={styles.photoEmpty}>
                          <Ionicons name="add" size={28} color={theme.textSecondary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>NOMBRE</Text>
              <TextInput testID="profile-name-input" style={styles.input} value={name} onChangeText={setName} placeholderTextColor={theme.textSecondary} />
              <Text style={styles.label}>SOBRE TI</Text>
              <TextInput testID="profile-bio-input" style={[styles.input, { height: 90, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} multiline maxLength={300} placeholderTextColor={theme.textSecondary} placeholder="Cuenta algo de ti..." />
              <Text style={styles.label}>INTERESES ({interests.length}/12)</Text>
              {INTEREST_GROUPS.map(group => (
                <View key={group.title} style={{ marginBottom: 14 }}>
                  <Text style={styles.groupLabel}>{group.title}</Text>
                  <View style={styles.tags}>
                    {group.items.map(i => (
                      <TouchableOpacity key={i} onPress={() => toggleInterest(i)} style={[styles.tag, interests.includes(i) && styles.tagOn]}>
                        <Text style={[styles.tagText, interests.includes(i) && styles.tagTextOn]}>{i}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity style={[styles.btnGhost, { flex: 1 }]} onPress={() => { setEditing(false); setPhotos(user.photos || []); setName(user.name); setBio(user.bio); setInterests(user.interests || []); }}>
                  <Text style={styles.btnGhostText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="profile-save-btn" style={[styles.btn, { flex: 1 }]} onPress={save} disabled={saving}>
                  {saving ? <ActivityIndicator color={theme.warmText} /> : <Text style={styles.btnText}>Guardar</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.avatarWrap}>
                {displayPhoto ? <Image source={{ uri: displayPhoto }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' }]}><Ionicons name="person" size={48} color={theme.textSecondary} /></View>}
              </View>
              <Text style={styles.name}>{user.name}, {user.age}</Text>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : <Text style={[styles.bio, { fontStyle: 'italic' }]}>Sin descripción aún.</Text>}
              {photos.length > 1 && (
                <View style={styles.photoStripWrap}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                    {photos.slice(1).map((p, i) => (
                      <Image key={i} source={{ uri: p }} style={styles.photoStripImg} />
                    ))}
                  </ScrollView>
                </View>
              )}
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
  card: { backgroundColor: theme.surface1, marginHorizontal: 16, borderRadius: 24, padding: 16 },
  avatarWrap: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 999 },
  name: { color: theme.textPrimary, fontSize: 24, fontWeight: '500', textAlign: 'center' },
  bio: { color: theme.textSecondary, fontSize: 15, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  photoStripWrap: { marginTop: 14 },
  photoStripImg: { width: 84, height: 105, borderRadius: 10 },
  label: { color: theme.cream, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10, marginTop: 14 },
  groupLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8 },
  input: { backgroundColor: theme.surface2, borderRadius: 12, padding: 14, color: theme.textPrimary, fontSize: 15 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoSlot: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImg: { width: '100%', height: '100%' },
  photoEmpty: { width: '100%', height: '100%', backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed', borderRadius: 12 },
  photoOverlay: { position: 'absolute', top: 4, right: 4 },
  mainBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: theme.cream, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  mainBadgeText: { color: theme.warmText, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: theme.surface2, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 11, borderWidth: 1, borderColor: theme.border },
  tagOn: { backgroundColor: theme.cream, borderColor: theme.cream },
  tagText: { color: theme.textPrimary, fontSize: 12 },
  tagTextOn: { color: theme.warmText, fontWeight: '600' },
  btn: { backgroundColor: theme.cream, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: theme.warmText, fontWeight: '700' },
  btnGhost: { backgroundColor: theme.surface2, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnGhostText: { color: theme.textPrimary, fontWeight: '500' },
  menu: { marginHorizontal: 16, marginTop: 24, backgroundColor: theme.surface1, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  menuText: { color: theme.textPrimary, fontSize: 15, flex: 1 },
});
