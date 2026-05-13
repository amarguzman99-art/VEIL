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
const MASK_SIZE = Math.min(width * 0.78, 360);

/** Animated drifting smoke cloud (moves diagonally, breathes, rotates) */
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
  const ringRotate = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) });
    maskFloat.value = withRepeat(withSequence(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.quad) })
    ), -1);
    halo.value = withRepeat(withSequence(
      withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.quad) })
    ), -1);
    ringRotate.value = withRepeat(withTiming(1, { duration: 60000, easing: Easing.linear }), -1);
  }, []);

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -8 + maskFloat.value * 16 }, { scale: 0.97 + maskFloat.value * 0.05 }],
    opacity: fadeIn.value,
  }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.18 + halo.value * 0.32,
    transform: [{ scale: 0.95 + halo.value * 0.16 }],
  }));
  const haloInnerStyle = useAnimatedStyle(() => ({
    opacity: 0.10 + halo.value * 0.25,
    transform: [{ scale: 0.92 + halo.value * 0.10 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value * 360}deg` }],
    opacity: fadeIn.value * 0.55,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 14 }],
  }));

  return (
    <View style={styles.root}>
      {/* 1. MARBLE TEXTURE — used as subtle luxury background (heavily muted) */}
      <ImageBackground
        source={require('../../assets/images/marble-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        imageStyle={{ opacity: 0.32 }}
      >
        {/* 2. DEEP EMERALD OVERLAYS — make marble whisper, not shout */}
        <LinearGradient
          colors={['rgba(6,24,20,0.85)', 'rgba(10,38,32,0.70)', 'rgba(6,24,20,0.95)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Radial vignette to focus center */}
        <LinearGradient
          colors={['rgba(6,24,20,0)', 'rgba(4,15,13,0.55)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0.5 }} end={{ x: 1, y: 1 }}
        />

        {/* 3. ANIMATED DRIFTING SMOKE LAYERS */}
        <SmokeCloud startX={-120} startY={height * 0.05} endX={width * 0.30} endY={height * 0.22} size={420} tint="rgba(255,255,255,0.10)" duration={14000} delay={0}    baseOpacity={0.55} />
        <SmokeCloud startX={width * 0.45} startY={height * 0.08} endX={width * 0.85} endY={height * 0.34} size={380} tint="rgba(212,184,134,0.10)" duration={17000} delay={2200} baseOpacity={0.45} />
        <SmokeCloud startX={-90}  startY={height * 0.42} endX={width * 0.25} endY={height * 0.58} size={460} tint="rgba(180,210,190,0.10)" duration={19000} delay={1500} baseOpacity={0.45} />
        <SmokeCloud startX={width * 0.55} startY={height * 0.55} endX={width * 0.05} endY={height * 0.78} size={420} tint="rgba(255,245,210,0.09)" duration={15500} delay={3500} baseOpacity={0.45} />
        <SmokeCloud startX={width * 0.65} startY={height * 0.75} endX={width * 0.15} endY={height * 0.95} size={460} tint="rgba(255,255,255,0.09)" duration={13000} delay={1100} baseOpacity={0.40} />
        <SmokeCloud startX={-70}  startY={height * 0.78} endX={width * 0.5}  endY={height * 0.65} size={380} tint="rgba(212,184,134,0.07)" duration={16000} delay={2800} baseOpacity={0.35} />

        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
          {/* TOP — ONLY the 18+ badge, subtle and refined */}
          <View style={styles.topBar}>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>18+</Text>
            </View>
          </View>

          {/* MIDDLE — the mask is the absolute hero */}
          <View style={styles.middle}>
            {/* Subtle rotating gold ring (decorative, far behind) */}
            <Animated.View style={[styles.goldRing, ringStyle]} />
            <Animated.View style={[styles.haloOuter, haloStyle]} />
            <Animated.View style={[styles.haloInner, haloInnerStyle]} />
            <Animated.View style={[styles.maskWrap, maskStyle]}>
              <Image
                source={require('../../assets/images/logo-mark.png')}
                style={styles.mask}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* BOTTOM — minimal, refined typography */}
          <Animated.View style={[styles.bottom, contentStyle]}>
            {/* Tiny gold divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerDot} />
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.taglineMain}>Una conexión real,{'\n'}sin máscaras.</Text>
            <Text style={styles.taglineSub}>Más allá de las apariencias.</Text>

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

const RING_SIZE = MASK_SIZE * 1.45;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#040F0D' },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 14 },
  ageBadge: { borderWidth: 1, borderColor: 'rgba(212,184,134,0.45)', paddingHorizontal: 11, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(10,38,32,0.5)' },
  ageBadgeText: { color: theme.cream, fontSize: 11, letterSpacing: 1.4, fontWeight: '700' },

  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  goldRing: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE, borderWidth: 1, borderColor: 'rgba(212,184,134,0.18)', borderStyle: 'solid' },
  haloOuter: { position: 'absolute', width: MASK_SIZE * 1.75, height: MASK_SIZE * 1.75, borderRadius: 999, backgroundColor: 'rgba(212,184,134,0.10)' },
  haloInner: { position: 'absolute', width: MASK_SIZE * 1.25, height: MASK_SIZE * 1.25, borderRadius: 999, backgroundColor: 'rgba(240,224,188,0.10)' },
  maskWrap: { width: MASK_SIZE, height: MASK_SIZE, alignItems: 'center', justifyContent: 'center' },
  mask: { width: '100%', height: '100%' },

  bottom: { paddingBottom: 6, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  dividerLine: { width: 28, height: 1, backgroundColor: 'rgba(212,184,134,0.55)' },
  dividerDot: { width: 4, height: 4, borderRadius: 999, backgroundColor: theme.cream },

  taglineMain: { color: theme.textPrimary, fontSize: 30, lineHeight: 36, fontFamily: SERIF, fontWeight: '400', letterSpacing: -0.7, marginBottom: 8, textAlign: 'center' },
  taglineSub: { color: theme.cream, fontSize: 14, fontFamily: SERIF, fontStyle: 'italic', letterSpacing: 0.3, marginBottom: 26, textAlign: 'center', opacity: 0.85 },

  btnPrimary: { borderRadius: 999, paddingVertical: 17, paddingHorizontal: 60, alignItems: 'center', marginBottom: 11, minWidth: width - 48 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(10,38,32,0.5)', borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.45)', minWidth: width - 48 },
  btnGhostText: { color: theme.cream, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 14, lineHeight: 16, paddingHorizontal: 8 },
});
