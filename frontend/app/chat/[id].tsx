import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, getConversation, sendMessage, getUser, getStoredUser } from '../../src/api';

export default function ChatDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [other, setOther] = useState<any>(null);
  const [meId, setMeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      const u = await getStoredUser(); if (u) setMeId(u.id);
      try {
        const [msgs, o] = await Promise.all([getConversation(id), getUser(id)]);
        setMessages(msgs); setOther(o);
      } catch {}
      setLoading(false);
    })();
    const t = setInterval(async () => {
      try { setMessages(await getConversation(id)); } catch {}
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
    } catch {}
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

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity testID="chat-back-btn" onPress={() => router.back()}><Ionicons name="chevron-back" size={26} color={theme.textPrimary} /></TouchableOpacity>
          {other?.photo ? <Image source={{ uri: other.photo }} style={styles.headerAvatar} /> : <View style={[styles.headerAvatar, { backgroundColor: theme.surface2 }]} />}
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName}>{other?.name}</Text>
            <Text style={styles.headerStatus}>● En línea</Text>
          </View>
        </View>
      </SafeAreaView>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.from_user_id === meId;
          return (
            <View style={[styles.bubbleWrap, mine ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }]}>
              <View style={[styles.bubble, mine ? styles.sender : styles.receiver]}>
                <Text style={mine ? styles.senderText : styles.receiverText}>{item.text}</Text>
              </View>
              {mine && item.read && (
                <View style={styles.readWrap}>
                  <Ionicons name="checkmark-done" size={14} color={theme.blueArrow} />
                  <Text style={styles.readText}>Leído</Text>
                </View>
              )}
            </View>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerAvatar: { width: 40, height: 40, borderRadius: 999 },
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
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface1 },
  input: { flex: 1, backgroundColor: theme.surface2, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: theme.textPrimary, fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderRadius: 999, backgroundColor: theme.warm, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 80, height: 80, borderRadius: 999, backgroundColor: 'rgba(232,217,184,0.10)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(232,217,184,0.30)', marginBottom: 18 },
  emptyTitle: { color: theme.textPrimary, fontSize: 22, fontWeight: '400', letterSpacing: -0.5 },
  emptySub: { color: theme.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  iceCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: theme.surface1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.border },
  iceText: { color: theme.textPrimary, fontSize: 13, flex: 1, lineHeight: 18 },
});
