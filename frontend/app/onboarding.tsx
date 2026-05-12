import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme, updateProfile } from '../src/api';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'flame',
    color: '#FF7B54',
    title: 'Bienvenido a tu velo',
    text: 'VEIL es un espacio para conectar de verdad. Sin máscaras impuestas, sin presión.',
  },
  {
    icon: 'flash',
    color: '#FBBF24',
    title: 'TAP: rompe el hielo',
    text: 'Envía un 🔥💜💋 sin palabras. Si te responde con otro tap, es match.',
  },
  {
    icon: 'shield-checkmark',
    color: '#34D399',
    title: 'Tu seguridad importa',
    text: 'Bloquea, reporta y elimina cualquier conversación. Cuidamos tu privacidad como si fuera nuestra.',
  },
  {
    icon: 'diamond',
    color: theme.cream,
    title: '¿Listo?',
    text: 'Tu velo está esperando ser descubierto. Comparte solo lo que quieras.',
  },
];

export default function Onboarding() {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const next = async () => {
    if (page < SLIDES.length - 1) {
      const nextPage = page + 1;
      scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
      setPage(nextPage);
    } else {
      try { await updateProfile({ onboarded: true }); } catch {}
      router.replace('/(tabs)/grid');
    }
  };

  const skip = async () => {
    try { await updateProfile({ onboarded: true }); } catch {}
    router.replace('/(tabs)/grid');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#2A1145', '#1A0938', '#080412']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, { top: -80, left: -80, backgroundColor: '#7C3AED', opacity: 0.4 }]} />
      <View style={[styles.blob, { bottom: 100, right: -100, backgroundColor: '#5B21B6', opacity: 0.3, width: 360, height: 360 }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top','bottom']}>
        <View style={styles.topBar}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => <View key={i} style={[styles.dot, i === page && styles.dotActive]} />)}
          </View>
          <TouchableOpacity onPress={skip} testID="onboarding-skip"><Text style={styles.skip}>Saltar</Text></TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={{ flex: 1 }}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={[styles.slide, { width }]}>
              <View style={[styles.iconCircle, { backgroundColor: `${slide.color}22`, borderColor: `${slide.color}55` }]}>
                <Ionicons name={slide.icon as any} size={56} color={slide.color} />
              </View>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.text}>{slide.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity testID="onboarding-next" activeOpacity={0.85} onPress={next}>
            <LinearGradient colors={['#F5EBD6', '#E8D9B8', '#C9B68C']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.btn}>
              <Text style={styles.btnText}>{page === SLIDES.length - 1 ? 'Empezar' : 'Continuar'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  blob: { position: 'absolute', width: 320, height: 320, borderRadius: 999 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: theme.cream, width: 40 },
  skip: { color: theme.textSecondary, fontSize: 14 },
  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  iconCircle: { width: 140, height: 140, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 40 },
  title: { color: theme.textPrimary, fontSize: 32, fontWeight: '300', letterSpacing: -1, textAlign: 'center', marginBottom: 14 },
  text: { color: theme.textSecondary, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  bottom: { padding: 24, paddingBottom: 12 },
  btn: { borderRadius: 999, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
