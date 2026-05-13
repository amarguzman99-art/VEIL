import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width, height } = Dimensions.get('window');
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
const MASK_SIZE = Math.min(width * 0.7, 320);

/**
 * Drifting smoke cloud — pure synthetic, fully animated (translate + scale + opacity)
 * Multiple of these are stacked at different positions/delays to simulate fog moving
 * across the marble background.
 */
function SmokeCloud({
  startX, startY, endX, endY, size, tint, duration, delay = 0, baseOpacity = 0.55,
}: {
  startX: number; startY: number; endX: number; endY: number;
  size: number; tint: string; duration: number; delay?: number; baseOpacity?: number;
}) {
  const t = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration, easing: Easing.inOut(Easing.quad) })
    ), -1));
    breathe.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1, { duration: duration * 0.6, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: duration * 0.6, easing: Easing.inOut(Easing.quad) })
    ), -1));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + (endX - startX) * t.value },
      { translateY: startY + (endY - startY) * t.value },
      { scale: 0.85 + breathe.value * 0.35 },
      { rotate: `${breathe.value * 25}deg` },
    ],
    opacity: baseOpacity * (0.45 + Math.sin(t.value * Math.PI) * 0.55),
  }));

  return (
    <Animated.View pointerEvents="none" style={[{
      position: 'absolute', width: size, height: size,
    }, animStyle]}>
      <LinearGradient
        colors={[tint, 'rgba(0,0,0,0)']}
        style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
      />
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const fadeIn = useSharedValue(0);
  const maskFloat = useSharedValue(0);
  const halo = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
    maskFloat.value = withRepeat(withSequence(
      withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 4500, easing: Easing.inOut(Easing.quad) })
    ), -1);
    halo.value = withRepeat(withSequence(
      withTiming(1, { duration: 3800, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 3800, easing: Easing.inOut(Easing.quad) })
    ), -1);
  }, []);

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -6 + maskFloat.value * 12 }, { scale: 0.98 + maskFloat.value * 0.04 }],
    opacity: fadeIn.value,
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + halo.value * 0.45,
    transform: [{ scale: 0.95 + halo.value * 0.18 }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value, transform: [{ translateY: (1 - fadeIn.value) * -10 }] }));

  return (
    <View style={styles.root}>
      {/* 1. MARBLE BACKGROUND — real emerald marble with gold veins */}
      <ImageBackground
        source={require('../../assets/images/marble-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* 2. EMERALD TINT — slightly darken & emerald-shift the marble for cohesion */}
        <LinearGradient
          colors={['rgba(15,58,46,0.55)', 'rgba(10,38,32,0.55)', 'rgba(6,24,20,0.85)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* 3. ANIMATED SMOKE — moving across the marble */}
        <SmokeCloud startX={-120} startY={height * 0.05} endX={width * 0.3} endY={height * 0.20} size={420} tint="rgba(255,255,255,0.13)" duration={14000} delay={0}    baseOpacity={0.55} />
        <SmokeCloud startX={width * 0.4} startY={height * 0.10} endX={width * 0.8} endY={height * 0.35} size={380} tint="rgba(212,184,134,0.10)" duration={17000} delay={2200} baseOpacity={0.50} />
        <SmokeCloud startX={-90}  startY={height * 0.40} endX={width * 0.25} endY={height * 0.55} size={480} tint="rgba(180,210,190,0.11)" duration={19000} delay={1500} baseOpacity={0.45} />
        <SmokeCloud startX={width * 0.5} startY={height * 0.55} endX={width * 0.05} endY={height * 0.75} size={420} tint="rgba(255,245,210,0.10)" duration={15500} delay={3500} baseOpacity={0.45} />
        <SmokeCloud startX={width * 0.6} startY={height * 0.75} endX={width * 0.2} endY={height * 0.95} size={460} tint="rgba(255,255,255,0.10)" duration={13000} delay={1100} baseOpacity={0.40} />
        <SmokeCloud startX={-70} startY={height * 0.80} endX={width * 0.5} endY={height * 0.65} size={380} tint="rgba(212,184,134,0.08)" duration={16000} delay={2800} baseOpacity={0.40} />
        <SmokeCloud startX={width * 0.7} startY={height * 0.30} endX={width * 0.15} endY={height * 0.45} size={340} tint="rgba(255,255,255,0.09)" duration={18000} delay={4200} baseOpacity={0.50} />

        {/* 4. CONTENT */}
        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
          {/* TOP BAR — VEIL title + 18+ badge */}
          <Animated.View style={[styles.topBar, titleStyle]}>
            <View style={{ width: 38 }} />
            <Text style={styles.brandTop}>V E I L</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>18+</Text>
            </View>
          </Animated.View>

          {/* MIDDLE — centered mask with golden halo */}
          <View style={styles.middle}>
            <Animated.View style={[styles.haloOuter, haloStyle]} />
            <Animated.View style={[styles.haloInner, haloStyle]} />
            <Animated.View style={[styles.maskWrap, maskStyle]}>
              <Image
                source={require('../../assets/images/logo-mark.png')}
                style={styles.mask}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* BOTTOM — taglines + CTAs + legal */}
          <Animated.View style={[styles.bottom, contentStyle]}>
            <Text style={styles.taglineGold}>Más allá de las apariencias…</Text>
            <Text style={styles.taglineMain}>Una conexión real{'\n'}sin máscaras.</Text>
            <Text style={styles.subtitle}>Libera tu esencia, sin filtros, tras el velo.</Text>

            <TouchableOpacity testID="welcome-register-btn" activeOpacity={0.85} onPress={() => router.push('/(auth)/orientation')}>
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#061814' },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 },
  brandTop: { color: theme.cream, fontSize: 28, fontFamily: SERIF, letterSpacing: 8, flex: 1, textAlign: 'center' },
  ageBadge: { borderWidth: 1, borderColor: 'rgba(212,184,134,0.55)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(10,38,32,0.6)' },
  ageBadgeText: { color: theme.cream, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' },

  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  haloOuter: { position: 'absolute', width: MASK_SIZE * 1.65, height: MASK_SIZE * 1.65, borderRadius: 999, backgroundColor: 'rgba(212,184,134,0.18)' },
  haloInner: { position: 'absolute', width: MASK_SIZE * 1.2, height: MASK_SIZE * 1.2, borderRadius: 999, backgroundColor: 'rgba(240,224,188,0.12)' },
  maskWrap: { width: MASK_SIZE, height: MASK_SIZE, alignItems: 'center', justifyContent: 'center' },
  mask: { width: '100%', height: '100%' },

  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, paddingHorizontal: 4 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(212,184,134,0.45)' },
  ornamentText: { color: theme.cream, fontSize: 10, fontWeight: '700', letterSpacing: 2.6 },

  bottom: { paddingBottom: 6 },
  taglineGold: { color: theme.cream, fontSize: 18, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 4, letterSpacing: -0.2 },
  taglineMain: { color: theme.textPrimary, fontSize: 30, lineHeight: 36, fontFamily: SERIF, fontWeight: '400', letterSpacing: -0.8, marginBottom: 10 },
  subtitle: { color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 20, fontStyle: 'italic' },
  btnPrimary: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginBottom: 11 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(10,38,32,0.6)', borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.55)' },
  btnGhostText: { color: theme.cream, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
