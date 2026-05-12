import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, G, Circle, Ellipse } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width, height } = Dimensions.get('window');
const LOGO = width * 0.7;

// Decorative venetian mask outline (background ornament)
function MaskOrnament({ size, opacity = 0.08 }: { size: number; opacity?: number }) {
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 200 120">
      <Defs>
        <SvgGradient id="ornGold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F5EBD6" stopOpacity={opacity * 2} />
          <Stop offset="1" stopColor="#7C3AED" stopOpacity={opacity} />
        </SvgGradient>
      </Defs>
      <G fill="none" stroke="url(#ornGold)" strokeWidth="0.6">
        {/* Mask outer outline */}
        <Path d="M 20 60 C 20 38, 45 28, 70 32 C 85 35, 92 45, 100 52 C 108 45, 115 35, 130 32 C 155 28, 180 38, 180 60 C 180 80, 160 95, 135 92 C 118 90, 108 80, 100 70 C 92 80, 82 90, 65 92 C 40 95, 20 80, 20 60 Z" />
        {/* Eye holes */}
        <Ellipse cx="60" cy="60" rx="20" ry="12" />
        <Ellipse cx="140" cy="60" rx="20" ry="12" />
        {/* Top decorative arch */}
        <Path d="M 30 35 Q 100 5, 170 35" />
        {/* Bottom flourish */}
        <Path d="M 60 95 Q 100 110, 140 95" />
      </G>
    </Svg>
  );
}

// Single elegant feather/silk curve
function SilkCurve({ width: w, height: h, opacity = 0.15, flip = false }: any) {
  return (
    <Svg width={w} height={h} viewBox="0 0 100 200" style={flip ? { transform: [{ scaleX: -1 }] } : {}}>
      <Defs>
        <SvgGradient id="silk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7C3AED" stopOpacity={opacity * 1.5} />
          <Stop offset="0.5" stopColor="#A78BFA" stopOpacity={opacity * 0.8} />
          <Stop offset="1" stopColor="#3B1273" stopOpacity={0} />
        </SvgGradient>
      </Defs>
      <Path
        d="M 50 0 C 30 30, 20 60, 35 100 C 50 130, 75 150, 60 200 L 0 200 L 0 0 Z"
        fill="url(#silk)"
      />
    </Svg>
  );
}

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
    opacity: 0.4 + halo.value * 0.35,
    transform: [{ scale: 1 + halo.value * 0.12 }],
  }));
  const haloInnerStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + halo.value * 0.3,
    transform: [{ scale: 1 - halo.value * 0.04 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      {/* Rich layered gradient — violet deep with cream warmth */}
      <LinearGradient
        colors={['#2A1145', '#1A0938', '#0F0524', '#080412']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle radial glow center-top */}
      <LinearGradient
        colors={['rgba(167,139,250,0.25)', 'rgba(167,139,250,0)']}
        style={[StyleSheet.absoluteFill, { height: height * 0.6 }]}
      />

      {/* Decorative mask ornaments scattered */}
      <View style={[styles.ornTopLeft]}>
        <MaskOrnament size={width * 0.7} opacity={0.06} />
      </View>
      <View style={[styles.ornBottomRight]}>
        <MaskOrnament size={width * 0.6} opacity={0.05} />
      </View>

      {/* Silk curtains on sides */}
      <View style={styles.silkLeft}><SilkCurve width={width * 0.5} height={height} opacity={0.18} /></View>
      <View style={styles.silkRight}><SilkCurve width={width * 0.5} height={height} opacity={0.18} flip /></View>

      {/* Glow blobs */}
      <View style={[styles.blob, { top: -60, left: -100, backgroundColor: '#7C3AED', opacity: 0.35 }]} />
      <View style={[styles.blob, { top: 250, right: -120, backgroundColor: '#5B21B6', opacity: 0.4, width: 360, height: 360 }]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        <View style={styles.top}>
          <Text style={styles.topLabel}>VEIL</Text>
          <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>18+</Text></View>
        </View>

        {/* Hero logo */}
        <View style={styles.middle}>
          <Animated.View style={[styles.halo, haloStyle, { backgroundColor: '#7C3AED' }]} />
          <Animated.View style={[styles.haloInner, haloInnerStyle, { backgroundColor: '#A78BFA' }]} />
          {/* Gold ring decoration around logo */}
          <View style={styles.goldRing} />
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image source={require('../../assets/images/logo-mark.png')} style={styles.logo} resizeMode="contain" />
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
            <Text style={{ color: theme.textPrimary }}>Detrás de cada </Text>
            <Text style={styles.taglineCream}>máscara,</Text>
            {'\n'}
            <Text style={{ color: theme.textPrimary }}>una </Text>
            <Text style={styles.taglineCream}>historia.</Text>
          </Text>
          <Text style={styles.subtitle}>Quítate la tuya. Descubre la suya. Cerca de ti.</Text>

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
  ornTopLeft: { position: 'absolute', top: 80, left: -40, transform: [{ rotate: '-10deg' }] },
  ornBottomRight: { position: 'absolute', bottom: 380, right: -50, transform: [{ rotate: '15deg' }] },
  silkLeft: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  silkRight: { position: 'absolute', right: 0, top: 0, bottom: 0 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 },
  topLabel: { color: theme.textPrimary, fontSize: 20, fontWeight: '300', letterSpacing: 10 },
  ageBadge: { borderWidth: 1, borderColor: 'rgba(232,217,184,0.4)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  ageBadgeText: { color: theme.cream, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  halo: { position: 'absolute', width: LOGO * 1.45, height: LOGO * 1.45, borderRadius: 999 },
  haloInner: { position: 'absolute', width: LOGO * 1.05, height: LOGO * 1.05, borderRadius: 999 },
  goldRing: { position: 'absolute', width: LOGO * 1.15, height: LOGO * 1.15, borderRadius: 999, borderWidth: 0.6, borderColor: 'rgba(232,217,184,0.35)' },
  logoWrap: { width: LOGO, height: LOGO, alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  bottom: { paddingBottom: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(232,217,184,0.25)' },
  preTagline: { color: theme.cream, fontSize: 10, fontWeight: '700', letterSpacing: 2.4 },
  tagline: { fontSize: 38, lineHeight: 44, fontWeight: '300', letterSpacing: -1.2, marginBottom: 14 },
  taglineCream: { color: theme.cream, fontStyle: 'italic', fontWeight: '400' },
  subtitle: { color: theme.textSecondary, fontSize: 14.5, lineHeight: 21, marginBottom: 26 },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#E8D9B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 14 },
  btnPrimaryText: { color: '#1A0E04', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(167,139,250,0.10)', borderRadius: 999, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.30)' },
  btnGhostText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 18, lineHeight: 16 },
});
