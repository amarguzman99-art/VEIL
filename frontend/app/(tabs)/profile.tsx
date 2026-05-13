import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme, me, updateProfile, clearAuth, deleteAccount } from '../../src/api';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 40 - 16) / 3;

const ORIENTATION_OPTIONS = [
  { id: 'man_seeks_woman',   gender: 'man',   looking: 'woman', label: 'Chico busca chica', emoji: '👨', emoji2: '👩' },
  { id: 'woman_seeks_man',   gender: 'woman', looking: 'man',   label: 'Chica busca chico', emoji: '👩', emoji2: '👨' },
  { id: 'man_seeks_man',     gender: 'man',   looking: 'man',   label: 'Chico busca chico', emoji: '👨', emoji2: '👨' },
  { id: 'woman_seeks_woman', gender: 'woman', looking: 'woman', label: 'Chica busca chica', emoji: '👩', emoji2: '👩' },
  { id: 'man_seeks_both',    gender: 'man',   looking: 'both',  label: 'Chico busca todo',  emoji: '👨', emoji2: '✨' },
  { id: 'woman_seeks_both',  gender: 'woman', looking: 'both',  label: 'Chica busca todo',  emoji: '👩', emoji2: '✨' },
];

const orientationLabel = (gender?: string, looking?: string) => {
  if (!gender || !looking) return 'No definida';
  const found = ORIENTATION_OPTIONS.find(o => o.gender === gender && o.looking === looking);
  return found ? found.label : 'Personalizada';
};

const PROMPTS_POOL = [
  'Detrás de mi velo hay...',
  'Mi cita ideal sería...',
  'Lo que me hace reír...',
  'Mi guilty pleasure...',
  'Lo más romántico que he hecho...',
  'Me obsesiona ahora...',
  'Si fueras una canción serías...',
  'Mi señal de que eres tú...',
  'Domingo perfecto...',
  'Algo que admiras...',
  'Banderas verdes...',
  'Antes de morir quiero...',
];

const INTEREST_GROUPS = [
  { title: 'Estilo de vida', items: ['☕ Café', '🍷 Vinos', '🥃 Cócteles', '🍽️ Cocina', '🌱 Vegano', '💪 Gym', '🏃 Running', '🧘 Yoga', '🚴 Ciclismo', '🏊 Natación', '⚽ Fútbol', '🎾 Tenis', '🥊 Boxeo'] },
  { title: 'Cultura', items: ['📖 Libros', '🎬 Cine', '🎭 Teatro', '🎨 Arte', '📐 Diseño', '🏛️ Museos', '📷 Foto', '📺 Series', '📰 Noticias', '🎙️ Podcasts'] },
  { title: 'Música', items: ['🎵 Pop', '🎸 Rock', '🎧 Electrónica', '🎤 Indie', '🪩 Disco', '🎼 Clásica', '🎷 Jazz', '💃 Reggaetón', '🪕 Country', '🎺 Latin'] },
  { title: 'Viajes & Aventura', items: ['✈️ Viajes', '🏔️ Montaña', '🌊 Mar', '🏖️ Playa', '🎒 Mochilero', '🚗 Road trip', '🏕️ Camping', '🛳️ Cruceros'] },
  { title: 'Vida nocturna', items: ['🌃 Noche', '🍸 Bares', '🪩 Clubbing', '🎉 Fiestas', '🎰 Casino', '🥳 Eventos', '🎤 Karaoke', '🍹 Brunch'] },
  { title: 'Hogar & Personal', items: ['🐕 Perros', '🐈 Gatos', '🌿 Plantas', '🎮 Gaming', '🧩 Puzzles', '🛍️ Moda', '💇 Estilo', '🛋️ Hogar', '🛁 Spa', '🕯️ Velas'] },
  { title: 'Profesional', items: ['💼 Negocios', '💻 Tech', '🎓 Estudiante', '🧪 Ciencia', '⚖️ Ley', '🩺 Salud', '🎬 Creativo', '🏗️ Arquitectura'] },
  { title: 'Conexión', items: ['💜 Romance', '🤝 Amistad', '☕ Café & charla', '🍿 Netflix & chill', '🚶 Paseos', '🎯 Citas reales', '🌈 Pride', '💬 Charlas largas'] },
];

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showOrientation, setShowOrientation] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await me();
      setUser(u); setName(u.name); setBio(u.bio);
      setInterests(u.interests || []); setPhotos(u.photos || []);
      setPrompts(u.prompts || []);
    })();
  }, []));

  const saveOrientation = async (gender: string, looking_for: string) => {
    try {
      const updated = await updateProfile({ gender, looking_for });
      setUser({ ...user, ...updated });
      setShowOrientation(false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'No se pudo guardar');
    }
  };

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
      const cleanPrompts = prompts.filter(p => p.q && p.a).slice(0, 3);
      const updated = await updateProfile({ name, bio, interests, photos: cleanPhotos, prompts: cleanPrompts });
      setUser({ ...user, ...updated });
      setEditing(false);
    } catch (e: any) { Alert.alert('Error', e?.response?.data?.detail || 'No se pudo guardar'); }
    setSaving(false);
  };

  const setPromptQ = (idx: number, q: string) => {
    const next = [...prompts];
    if (!next[idx]) next[idx] = { q: '', a: '' };
    next[idx] = { ...next[idx], q };
    setPrompts(next);
  };
  const setPromptA = (idx: number, a: string) => {
    const next = [...prompts];
    if (!next[idx]) next[idx] = { q: '', a: '' };
    next[idx] = { ...next[idx], a };
    setPrompts(next);
  };
  const removePrompt = (idx: number) => setPrompts(prompts.filter((_, i) => i !== idx));

  // Completion meter
  const completion = (() => {
    let score = 30; // base for having account
    if (user?.photo) score += 15;
    if (photos.length >= 3) score += 15;
    if (bio?.length >= 30) score += 10;
    if (interests?.length >= 3) score += 15;
    if (prompts?.filter((p: any) => p.q && p.a).length >= 2) score += 15;
    return Math.min(100, score);
  })();

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

              <Text style={styles.label}>RESPUESTAS ({prompts.filter(p=>p.q&&p.a).length}/3)</Text>
              <Text style={[styles.groupLabel, { marginBottom: 10 }]}>Comparte 3 destellos de quién eres</Text>
              {[0, 1, 2].map(idx => {
                const p = prompts[idx] || { q: '', a: '' };
                return (
                  <View key={idx} style={styles.promptEditor}>
                    <TouchableOpacity
                      style={styles.promptQuestionBtn}
                      onPress={() => {
                        Alert.alert('Elige una pregunta', '', PROMPTS_POOL.map(pq => ({
                          text: pq, onPress: () => setPromptQ(idx, pq)
                        })).concat([{ text: 'Cancelar', style: 'cancel' } as any]));
                      }}
                    >
                      <Text style={p.q ? styles.promptQText : styles.promptQPlaceholder}>
                        {p.q || 'Elige una pregunta...'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                    {p.q && (
                      <View style={{ position: 'relative' }}>
                        <TextInput
                          testID={`prompt-answer-${idx}`}
                          style={styles.promptAnswer}
                          value={p.a}
                          onChangeText={(t) => setPromptA(idx, t)}
                          placeholder="Tu respuesta..."
                          placeholderTextColor={theme.textSecondary}
                          maxLength={120}
                          multiline
                        />
                        <TouchableOpacity style={styles.promptClear} onPress={() => removePrompt(idx)}>
                          <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
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
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Text style={styles.name}>{user.name}, {user.age}</Text>
                {user.verified && <Ionicons name="checkmark-circle" size={20} color={theme.blueArrow} />}
              </View>
              {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : <Text style={[styles.bio, { fontStyle: 'italic' }]}>Sin descripción aún.</Text>}

              {/* Completion meter */}
              <View style={styles.meterWrap}>
                <View style={styles.meterHeader}>
                  <Text style={styles.meterLabel}>Tu velo está al</Text>
                  <Text style={styles.meterValue}>{completion}%</Text>
                </View>
                <View style={styles.meterBar}>
                  <View style={[styles.meterFill, { width: `${completion}%` }]} />
                </View>
                {completion < 100 && (
                  <Text style={styles.meterTip}>
                    {!user.photo ? '✦ Añade una foto principal' :
                     photos.length < 3 ? '✦ Añade más fotos para destacar' :
                     interests.length < 3 ? '✦ Añade intereses' :
                     prompts.filter(p => p.q && p.a).length < 2 ? '✦ Responde a alguna pregunta' :
                     '✦ Casi perfecto'}
                  </Text>
                )}
              </View>

              {photos.length > 1 && (
                <View style={styles.photoStripWrap}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
                    {photos.slice(1).map((p, i) => (
                      <Image key={i} source={{ uri: p }} style={styles.photoStripImg} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {prompts.filter(p => p.q && p.a).length > 0 && (
                <View style={{ marginTop: 16 }}>
                  {prompts.filter(p => p.q && p.a).map((p, i) => (
                    <View key={i} style={styles.promptDisplay}>
                      <Text style={styles.promptDispQ}>{p.q}</Text>
                      <Text style={styles.promptDispA}>{p.a}</Text>
                    </View>
                  ))}
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
            <TouchableOpacity testID="profile-preferences-btn" style={styles.menuItem} onPress={() => setShowOrientation(true)}>
              <Ionicons name="heart-outline" size={20} color={theme.cream} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>Preferencias</Text>
                <Text style={styles.menuSub}>{orientationLabel(user.gender, user.looking_for)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
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

      {/* Orientation preferences modal */}
      <Modal visible={showOrientation} transparent animationType="slide" onRequestClose={() => setShowOrientation(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={() => setShowOrientation(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tus preferencias</Text>
            <Text style={styles.modalSub}>Esto solo afecta a quién verás. Cero etiquetas.</Text>
            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
              {ORIENTATION_OPTIONS.map(o => {
                const selected = user?.gender === o.gender && user?.looking_for === o.looking;
                return (
                  <TouchableOpacity
                    key={o.id}
                    testID={`pref-${o.id}`}
                    activeOpacity={0.8}
                    onPress={() => saveOrientation(o.gender, o.looking)}
                    style={[styles.orientOption, selected && styles.orientOptionOn]}
                  >
                    <View style={styles.orientIconRow}>
                      <Text style={styles.orientEmoji}>{o.emoji}</Text>
                      <Ionicons name="heart" size={13} color={selected ? theme.warmText : theme.cream} />
                      <Text style={styles.orientEmoji}>{o.emoji2}</Text>
                    </View>
                    <Text style={[styles.orientLabel, selected && styles.orientLabelOn]}>{o.label}</Text>
                    {selected && (
                      <View style={styles.orientCheck}>
                        <Ionicons name="checkmark" size={14} color={theme.warmText} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  menuSub: { color: theme.textSecondary, fontSize: 11, marginTop: 2 },
  // Orientation modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36, maxHeight: '78%', borderTopWidth: 1, borderColor: theme.border },
  modalHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: theme.surface3, alignSelf: 'center', marginBottom: 14 },
  modalTitle: { color: theme.textPrimary, fontSize: 22, fontWeight: '500', textAlign: 'center', letterSpacing: -0.4 },
  modalSub: { color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 16, fontStyle: 'italic' },
  orientOption: { backgroundColor: theme.surface1, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 14, position: 'relative' },
  orientOptionOn: { backgroundColor: theme.cream, borderColor: theme.cream },
  orientIconRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  orientEmoji: { fontSize: 22 },
  orientLabel: { color: theme.textPrimary, fontSize: 14, fontWeight: '600', flex: 1 },
  orientLabelOn: { color: theme.warmText },
  orientCheck: { width: 24, height: 24, borderRadius: 999, backgroundColor: theme.warmText, alignItems: 'center', justifyContent: 'center' },
  meterWrap: { marginTop: 18, paddingHorizontal: 6 },
  meterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  meterLabel: { color: theme.textSecondary, fontSize: 12 },
  meterValue: { color: theme.cream, fontSize: 14, fontWeight: '700' },
  meterBar: { height: 5, backgroundColor: theme.surface2, borderRadius: 999, overflow: 'hidden' },
  meterFill: { height: 5, backgroundColor: theme.cream, borderRadius: 999 },
  meterTip: { color: theme.textSecondary, fontSize: 11, marginTop: 6, textAlign: 'center' },
  promptDisplay: { backgroundColor: theme.surface2, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: theme.cream },
  promptDispQ: { color: theme.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: 0.3 },
  promptDispA: { color: theme.textPrimary, fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  promptEditor: { marginBottom: 12 },
  promptQuestionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface2, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: theme.border },
  promptQText: { color: theme.textPrimary, fontSize: 13, fontWeight: '500', flex: 1 },
  promptQPlaceholder: { color: theme.textSecondary, fontSize: 13, fontStyle: 'italic' },
  promptAnswer: { backgroundColor: theme.surface2, borderRadius: 12, padding: 12, marginTop: 6, color: theme.textPrimary, fontSize: 14, lineHeight: 20, minHeight: 60, textAlignVertical: 'top', borderLeftWidth: 2, borderLeftColor: theme.cream },
  promptClear: { position: 'absolute', top: 12, right: 10 },
});
