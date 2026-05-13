import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, withSpring, FadeIn, ZoomIn } from 'react-native-reanimated';
import { theme, getConversation, sendMessage, getUser, getStoredUser, sendGift, getRevealStatus, revealNow, GIFT_CATALOG } from '../../src/api';

// Veiled photo overlay (smoke/blur with golden mask)
function VeiledAvatar({ photo, size = 40, revealed }: { photo?: string; size?: number; revealed: boolean }) {
  const shimmer = useSharedValue(0);
  useEffect(() => {
    shimmer.value = withRepeat(withSequence(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.quad) })
    ), -1);
  }, []);
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: 0.4 + shimmer.value * 0.4 }));

  if (revealed && photo) {
    return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: theme.surface2 }}>
      {photo && <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2, opacity: 0.35 }} blurRadius={18} />}
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['rgba(15,46,39,0.55)', 'rgba(46,122,96,0.45)', 'rgba(15,46,39,0.6)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: size * 0.5 }}>🎭</Text>
      </View>
    </View>
  );
}

// Gift bubble (animated)
function GiftBubble({ gift_type, mine }: { gift_type: string; mine: boolean }) {
  const bounce = useSharedValue(0);
  const sparkle = useSharedValue(0);
  useEffect(() => {
    bounce.value = withSequence(withSpring(1, { damping: 6, stiffness: 90 }), withTiming(1, { duration: 0 }));
    sparkle.value = withRepeat(withSequence(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) })
    ), -1);
  }, []);
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: 0.4 + bounce.value * 0.6 }] }));
  const sparkleStyle = useAnimatedStyle(() => ({ opacity: 0.3 + sparkle.value * 0.7 }));

  const gift = GIFT_CATALOG.find(g => g.id === gift_type);
  if (!gift) return null;

  return (
    <Animated.View entering={ZoomIn.duration(400)} style={[styles.giftWrap, mine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
      <LinearGradient
        colors={['rgba(212,184,134,0.18)', 'rgba(212,184,134,0.05)']}
        style={styles.giftCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View style={[styles.giftGlow, sparkleStyle, { backgroundColor: gift.color + '40' }]} />
        <Animated.Text style={[styles.giftEmoji, bounceStyle]}>{gift.emoji}</Animated.Text>
        <Text style={styles.giftName}>{gift.name}</Text>
        <Text style={styles.giftSub}>{mine ? 'Enviaste un regalo' : 'Te ha enviado un regalo'}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [other, setOther] = useState<any>(null);
  const [meId, setMeId] = useState<string>('');
  const [meUser, setMeUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reveal, setReveal] = useState<any>({ revealed: false, my_messages: 0, their_messages: 0, threshold: 3 });
  const [showGifts, setShowGifts] = useState(false);
  const listRef = useRef<FlatList>(null);

  const refreshReveal = useCallback(async () => {
    try { setReveal(await getRevealStatus(id)); } catch {}
  }, [id]);

  useEffect(() => {
    (async () => {
      const u = await getStoredUser();
      if (u) { setMeId(u.id); setMeUser(u); }
      try {
        const [msgs, o, rev] = await Promise.all([getConversation(id), getUser(id), getRevealStatus(id)]);
        setMessages(msgs); setOther(o); setReveal(rev);
      } catch {}
      setLoading(false);
    })();
    const t = setInterval(async () => {
      try {
        const [m, r] = await Promise.all([getConversation(id), getRevealStatus(id)]);
        setMessages(m); setReveal(r);
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [id]);

  const send = async () => {
    const txt = text.trim(); if (!txt) return;
    setText('');
    try {
      const msg = await sendMessage(id, txt);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
      refreshReveal();
    } catch {}
  };

  const handleSendGift = async (giftId: string) => {
    setShowGifts(false);
    try {
      const msg = await sendGift(id, giftId);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd(), 100);
    } catch (e: any) {
      const detail = e?.response?.data?.detail || 'No se pudo enviar el regalo';
      Alert.alert('Regalo', detail);
    }
  };

  const handleManualReveal = async () => {
    if (!meUser?.is_premium) {
      Alert.alert('VEIL Privé', 'La revelación instantánea es exclusiva de VEIL Privé.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ver planes', onPress: () => router.push('/premium') },
      ]);
      return;
    }
    Alert.alert('Revelar ahora', '¿Desvelar el rostro al instante? Esta acción es mutua.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Revelar', onPress: async () => {
        try { setReveal(await revealNow(id)); } catch (e: any) {
          Alert.alert('Error', e?.response?.data?.detail || 'No se pudo revelar');
        }
      }},
    ]);
  };

  const useIcebreaker = (txt: string) => { setText(txt); };

  const ICEBREAKERS = other?.interests?.length > 0 ? [
    `Hola 👋 He visto que te gusta ${other.interests[0].split(' ').slice(1).join(' ')}, ¿cuál es tu favorito?`,
    `Cuéntame, ¿qué te trae a VEIL?`,
    `Si pudieras quedar este finde, ¿qué plan propones?`,
  ] : [
    `Hola 👋 ¿Qué tal el día?`,
    `Cuéntame, ¿qué te trae a VEIL?`,
    `Si pudieras quedar este finde, ¿qué plan propones?`,
  ];

  if (loading) return <View style={styles.container}><ActivityIndicator color={theme.warm} style={{ marginTop: 100 }} /></View>;

  const progressFraction = Math.min(1,
    (Math.min(reveal.my_messages, reveal.threshold) + Math.min(reveal.their_messages, reveal.threshold))
    / (reveal.threshold * 2)
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity testID="chat-back-btn" onPress={() => router.back()}><Ionicons name="chevron-back" size={26} color={theme.textPrimary} /></TouchableOpacity>
          <VeiledAvatar photo={other?.photo} size={40} revealed={reveal.revealed} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{reveal.revealed ? other?.name : `${other?.name?.[0] ?? '?'} · Tras el velo`}</Text>
            <Text style={styles.headerStatus}>● En línea</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Reveal banner */}
      {!reveal.revealed && (
        <View style={styles.revealBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="eye-off-outline" size={14} color={theme.cream} />
            <Text style={styles.revealText}>
              Tras el velo · {reveal.my_messages}/{reveal.threshold} tú · {reveal.their_messages}/{reveal.threshold} él/ella
            </Text>
            <TouchableOpacity onPress={handleManualReveal} style={styles.revealBtn}>
              <Ionicons name="diamond" size={11} color={theme.warmText} />
              <Text style={styles.revealBtnText}>Revelar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressFraction * 100}%` }]} />
          </View>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.from_user_id === meId;
          if (item.kind === 'gift') {
            return <GiftBubble gift_type={item.gift_type} mine={mine} />;
          }
          return (
            <Animated.View entering={FadeIn.duration(200)} style={[styles.bubbleWrap, mine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
              <View style={[styles.bubble, mine ? styles.sender : styles.receiver]}>
                <Text style={mine ? styles.senderText : styles.receiverText}>{item.text}</Text>
              </View>
              {mine && item.read && (
                <View style={styles.readWrap}>
                  <Ionicons name="checkmark-done" size={14} color={theme.blueArrow} />
                  <Text style={styles.readText}>Leído</Text>
                </View>
              )}
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 24 }}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color={theme.cream} />
            </View>
            <Text style={styles.emptyTitle}>Rompe el hielo</Text>
            <Text style={styles.emptySub}>Sé tú mismo. Aquí van algunas ideas para empezar:</Text>
            <View style={{ gap: 8, marginTop: 16, width: '100%' }}>
              {ICEBREAKERS.map((ice, i) => (
                <TouchableOpacity key={i} style={styles.iceCard} onPress={() => useIcebreaker(ice)} activeOpacity={0.7}>
                  <Ionicons name="sparkles" size={14} color={theme.cream} />
                  <Text style={styles.iceText}>{ice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TouchableOpacity testID="chat-gift-btn" style={styles.giftBtn} onPress={() => setShowGifts(true)}>
          <Ionicons name="gift" size={20} color={theme.cream} />
        </TouchableOpacity>
        <TextInput
          testID="chat-input"
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity testID="chat-send-btn" style={[styles.sendBtn, !text.trim() && { opacity: 0.4 }]} onPress={send} disabled={!text.trim()}>
          <Ionicons name="send" size={18} color={theme.warmText} />
        </TouchableOpacity>
      </View>

      {/* Gift picker modal */}
      <Modal visible={showGifts} transparent animationType="slide" onRequestClose={() => setShowGifts(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowGifts(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Envía un regalo</Text>
            <Text style={styles.modalSub}>Un detalle delicado vale más que mil palabras.</Text>
            <ScrollView style={{ maxHeight: 460 }} contentContainerStyle={{ gap: 10, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
              {GIFT_CATALOG.map(g => {
                const locked = g.tier === 'elite' && !meUser?.is_premium;
                return (
                  <TouchableOpacity
                    key={g.id}
                    testID={`gift-${g.id}`}
                    activeOpacity={0.8}
                    onPress={() => locked
                      ? Alert.alert('VEIL Élite', `${g.name} es exclusivo de Élite.`, [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Ver planes', onPress: () => { setShowGifts(false); router.push('/premium'); } }
                        ])
                      : handleSendGift(g.id)
                    }
                    style={[styles.giftPickerCard, locked && { opacity: 0.6 }]}
                  >
                    <View style={[styles.giftPickerIcon, { backgroundColor: g.color + '20', borderColor: g.color + '50' }]}>
                      <Text style={{ fontSize: 28 }}>{g.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.giftPickerName}>{g.name}</Text>
                        {g.tier === 'elite' && (
                          <View style={styles.elitePill}>
                            <Ionicons name="diamond" size={9} color={theme.warmText} />
                            <Text style={styles.elitePillText}>ÉLITE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.giftPickerSub}>{g.subtitle}</Text>
                    </View>
                    {locked ? <Ionicons name="lock-closed" size={18} color={theme.textSecondary} /> : <Ionicons name="chevron-forward" size={18} color={theme.cream} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {!meUser?.is_premium && (
              <Text style={styles.giftFooter}>3 regalos gratis cada 24h · Élite los desbloquea todos</Text>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerName: { color: theme.textPrimary, fontSize: 16, fontWeight: '600' },
  headerStatus: { color: '#4ADE80', fontSize: 11, marginTop: 2 },
  bubbleWrap: { maxWidth: '80%' },
  bubble: { paddingVertical: 10, paddingHorizontal: 14 },
  sender: { backgroundColor: theme.warm, borderTopRightRadius: 20, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 4 },
  receiver: { backgroundColor: theme.surface2, borderTopRightRadius: 20, borderTopLeftRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 4 },
  senderText: { color: theme.warmText, fontSize: 15, lineHeight: 20 },
  receiverText: { color: theme.textPrimary, fontSize: 15, lineHeight: 20 },
  readWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginTop: 4 },
  readText: { color: theme.blueArrow, fontSize: 10 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface1 },
  input: { flex: 1, backgroundColor: theme.surface2, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: theme.textPrimary, fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: theme.warm, alignItems: 'center', justifyContent: 'center' },
  giftBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  emptyIcon: { width: 80, height: 80, borderRadius: 999, backgroundColor: 'rgba(232,217,184,0.10)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(232,217,184,0.30)', marginBottom: 18 },
  emptyTitle: { color: theme.textPrimary, fontSize: 22, fontWeight: '400', letterSpacing: -0.5 },
  emptySub: { color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  iceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surface1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.border },
  iceText: { color: theme.textPrimary, fontSize: 13, flex: 1, lineHeight: 18 },
  // Reveal banner
  revealBanner: { backgroundColor: 'rgba(15,46,39,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  revealText: { color: theme.textSecondary, fontSize: 11, flex: 1 },
  revealBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.cream, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  revealBtnText: { color: theme.warmText, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  progressTrack: { height: 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginTop: 6 },
  progressFill: { height: 2, backgroundColor: theme.cream, borderRadius: 999 },
  // Gift bubble
  giftWrap: { maxWidth: '70%' },
  giftCard: { borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.35)', position: 'relative', overflow: 'hidden' },
  giftGlow: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, borderRadius: 999 },
  giftEmoji: { fontSize: 54, marginBottom: 6 },
  giftName: { color: theme.cream, fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  giftSub: { color: theme.textSecondary, fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  // Modal sheet
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 24, borderTopWidth: 1, borderColor: theme.border },
  modalHandle: { width: 40, height: 4, borderRadius: 999, backgroundColor: theme.surface3, alignSelf: 'center', marginBottom: 14 },
  modalTitle: { color: theme.textPrimary, fontSize: 22, fontWeight: '500', textAlign: 'center', letterSpacing: -0.4 },
  modalSub: { color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 16, fontStyle: 'italic' },
  giftPickerCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surface1, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: theme.border },
  giftPickerIcon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  giftPickerName: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
  giftPickerSub: { color: theme.textSecondary, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  elitePill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: theme.cream, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  elitePillText: { color: theme.warmText, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  giftFooter: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
});
