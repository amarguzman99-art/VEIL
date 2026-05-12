import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width, height } = Dimensions.get('window');
const LOGO = width * 0.62;
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export default function Welcome() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const float = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1200 });
    pulse.value = withRepeat(withSequence(withTiming(1.025, { duration: 3200, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.quad) })), -1);
    float.value = withRepeat(withSequence(withTiming(-4, { duration: 4000, easing: Easing.inOut(Easing.quad) }), withTiming(4, { duration: 4000, easing: Easing.inOut(Easing.quad) })), -1);
    halo.value = withRepeat(withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: float.value }],
    opacity: fadeIn.value,
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + halo.value * 0.25,
    transform: [{ scale: 1 + halo.value * 0.1 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      {/* Deep emerald gradient background with smoke effect */}
      <LinearGradient
        colors={['#143A30', '#0A2620', '#061814', '#040F0C']}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Smoke/glow radial */}
      <View style={[styles.smoke, { top: '15%' }]} />
      <View style={[styles.smoke, { top: '50%', left: '60%', backgroundColor: 'rgba(212,184,134,0.08)' }]} />

      {/* Soft emerald blobs */}
      <View style={[styles.blob, { top: -120, left: -100, backgroundColor: '#1F5A48', opacity: 0.5 }]} />
      <View style={[styles.blob, { top: 200, right: -140, backgroundColor: '#0F3A2E', opacity: 0.7, width: 400, height: 400 }]} />
      <View style={[styles.blob, { bottom: 150, left: -80, backgroundColor: '#2E7A60', opacity: 0.25 }]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        {/* Top: VEIL wordmark serif + 18+ badge */}
        <View style={styles.top}>
          <View style={{ flex: 1 }} />
          <Text style={styles.brandWordmark}>V E I L</Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>18+</Text></View>
          </View>
        </View>

        {/* Hero logo */}
        <View style={styles.middle}>
          <Animated.View style={[styles.halo, haloStyle]} />
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image source={require('../../assets/images/logo-mark.png')} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        {/* Bottom content */}
        <Animated.View style={[styles.bottom, contentStyle]}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.preTagline}>CITAS · ENCUENTROS · SIN ETIQUETAS</Text>
            <View style={styles.ornamentLine} />
          </View>

          <Text style={styles.taglineGold}>Más allá de las apariencias…</Text>
          <Text style={styles.taglineMain}>Una conexión real{'\n'}sin máscaras.</Text>
          <Text style={styles.subtitle}>Libera tu esencia, sin filtros, tras el velo.</Text>

          <TouchableOpacity testID="welcome-register-btn" activeOpacity={0.85} onPress={() => router.push('/(auth)/register')}>
            <LinearGradient
              colors={['#F0E0BC', '#D4B886', '#A88B4E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Crear mi velo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity testID="welcome-login-btn" style={styles.btnGhost} activeOpacity={0.7} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.btnGhostText}>Ya formo parte</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Al continuar aceptas tener <Text style={{ color: theme.cream, fontWeight: '700' }}>18+ años</Text>, los Términos y la Política de Privacidad.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, overflow: 'hidden' },
  smoke: { position: 'absolute', width: width * 1.5, height: height * 0.4, left: -width * 0.25, borderRadius: 999, backgroundColor: 'rgba(212,184,134,0.04)' },
  blob: { position: 'absolute', width: 340, height: 340, borderRadius: 999 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', paddingTop: 12 },
  brandWordmark: { color: theme.cream, fontSize: 26, letterSpacing: 6, fontFamily: SERIF, fontWeight: '400' },
  ageBadge: { borderWidth: 1, borderColor: 'rgba(212,184,134,0.5)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  ageBadgeText: { color: theme.cream, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  halo: { position: 'absolute', width: LOGO * 1.55, height: LOGO * 1.55, borderRadius: 999, backgroundColor: '#D4B886' },
  logoWrap: { width: LOGO, height: LOGO, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  bottom: { paddingBottom: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(212,184,134,0.3)' },
  preTagline: { color: theme.cream, fontSize: 10, fontWeight: '700', letterSpacing: 2.6 },
  taglineGold: { color: theme.cream, fontSize: 20, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 6, letterSpacing: -0.3 },
  taglineMain: { color: theme.textPrimary, fontSize: 34, lineHeight: 40, fontFamily: SERIF, fontWeight: '400', letterSpacing: -1, marginBottom: 14 },
  subtitle: { color: theme.textSecondary, fontSize: 14.5, lineHeight: 21, marginBottom: 28, fontStyle: 'italic' },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#D4B886', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 24, elevation: 14 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'transparent', borderRadius: 999, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.5)' },
  btnGhostText: { color: theme.cream, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 18, lineHeight: 16 },
});
