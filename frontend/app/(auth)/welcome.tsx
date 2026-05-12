import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width } = Dimensions.get('window');
const LOGO = width * 0.62;

export default function Welcome() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const float = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const halo1 = useSharedValue(0);
  const halo2 = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1000 });
    pulse.value = withRepeat(withSequence(withTiming(1.03, { duration: 2800, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.quad) })), -1);
    float.value = withRepeat(withSequence(withTiming(-5, { duration: 3500, easing: Easing.inOut(Easing.quad) }), withTiming(5, { duration: 3500, easing: Easing.inOut(Easing.quad) })), -1);
    halo1.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.quad) }), -1, true);
    halo2.value = withRepeat(withTiming(1, { duration: 5500, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: float.value }],
    opacity: fadeIn.value,
  }));
  const halo1Style = useAnimatedStyle(() => ({
    opacity: 0.35 + halo1.value * 0.3,
    transform: [{ scale: 1 + halo1.value * 0.15 }],
  }));
  const halo2Style = useAnimatedStyle(() => ({
    opacity: 0.2 + halo2.value * 0.25,
    transform: [{ scale: 1.1 + halo2.value * 0.2 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#1A0938', '#0F0524', '#080412', '#050208']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative glow blobs */}
      <View style={[styles.blob, { top: -100, left: -100, backgroundColor: '#5B21B6', opacity: 0.4 }]} />
      <View style={[styles.blob, { top: 200, right: -140, backgroundColor: '#3B1273', opacity: 0.5, width: 380, height: 380 }]} />
      <View style={[styles.blob, { bottom: 100, left: -80, backgroundColor: '#7C3AED', opacity: 0.25 }]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        <View style={styles.top}>
          <Text style={styles.topLabel}>VEIL</Text>
          <Text style={styles.topLabel2}>18+ · LGBTQ+</Text>
        </View>

        {/* Hero logo */}
        <View style={styles.middle}>
          <Animated.View style={[styles.halo, halo2Style, { backgroundColor: '#7C3AED' }]} />
          <Animated.View style={[styles.haloInner, halo1Style, { backgroundColor: '#A78BFA' }]} />
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image source={require('../../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* Bottom */}
        <Animated.View style={[styles.bottom, contentStyle]}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.preTagline}>CITAS · ENCUENTROS · SIN ETIQUETAS</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={styles.tagline}>
            <Text style={{ color: theme.textPrimary }}>Levanta el </Text>
            <Text style={styles.taglineCream}>velo.</Text>
            {'\n'}
            <Text style={{ color: theme.textPrimary }}>Encuentra tu </Text>
            <Text style={styles.taglineCream}>fuego.</Text>
          </Text>
          <Text style={styles.subtitle}>Donde el deseo se desvela. Cerca de ti.</Text>

          <TouchableOpacity testID="welcome-register-btn" activeOpacity={0.85} onPress={() => router.push('/(auth)/register')}>
            <LinearGradient
              colors={['#F5EBD6', '#E8D9B8', '#C9B68C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Crear mi velo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity testID="welcome-login-btn" style={styles.btnGhost} activeOpacity={0.7} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.btnGhostText}>Ya tengo cuenta</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Al continuar aceptas tener 18+ años, los Términos y la Política de Privacidad.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, overflow: 'hidden' },
  blob: { position: 'absolute', width: 320, height: 320, borderRadius: 999 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  topLabel: { color: theme.textPrimary, fontSize: 20, fontWeight: '300', letterSpacing: 9 },
  topLabel2: { color: theme.textSecondary, fontSize: 10, letterSpacing: 1.8, fontWeight: '700' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  halo: { position: 'absolute', width: LOGO * 1.6, height: LOGO * 1.6, borderRadius: 999 },
  haloInner: { position: 'absolute', width: LOGO * 1.2, height: LOGO * 1.2, borderRadius: 999 },
  logoWrap: { width: LOGO, height: LOGO, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  bottom: { paddingBottom: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(232,217,184,0.25)' },
  preTagline: { color: theme.cream, fontSize: 10, fontWeight: '700', letterSpacing: 2.6 },
  tagline: { fontSize: 42, lineHeight: 46, fontWeight: '300', letterSpacing: -1.5, marginBottom: 14 },
  taglineCream: { color: theme.cream, fontStyle: 'italic', fontWeight: '400' },
  subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 28 },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#E8D9B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 14 },
  btnPrimaryText: { color: '#1A0E04', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(167,139,250,0.10)', borderRadius: 999, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.30)' },
  btnGhostText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 18, lineHeight: 16 },
});
