import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing,
} from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width, height } = Dimensions.get('window');
const HERO_SIZE = width; // square hero (image is 1:1)
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

// Drifting smoke layer (synthetic atmospheric movement)
function SmokeLayer({
  delay = 0, duration = 9000, top, left, size, tint = 'rgba(212,184,134,0.10)', opacity = 1
}: { delay?: number; duration?: number; top: number; left: number; size: number; tint?: string; opacity?: number }) {
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    drift.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration, easing: Easing.inOut(Easing.quad) })
    ), -1));
    breathe.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1, { duration: duration * 0.7, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: duration * 0.7, easing: Easing.inOut(Easing.quad) })
    ), -1));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -40 + drift.value * 80 },
      { translateY: -30 + breathe.value * 60 },
      { scale: 1 + breathe.value * 0.22 },
    ],
    opacity: opacity * (0.35 + drift.value * 0.55),
  }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', top, left, width: size, height: size, borderRadius: size }, animStyle]}>
      <LinearGradient
        colors={[tint, 'rgba(0,0,0,0)']}
        style={{ width: '100%', height: '100%', borderRadius: size }}
      />
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const fadeIn = useSharedValue(0);
  const heroScale = useSharedValue(1);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
    heroScale.value = withRepeat(withSequence(
      withTiming(1.015, { duration: 5500, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: 5500, easing: Easing.inOut(Easing.quad) })
    ), -1);
  }, []);

  const heroStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: heroScale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      {/* Emerald gradient that matches the artwork background, so the hero blends seamlessly */}
      <LinearGradient
        colors={['#0F3A2E', '#0A2620', '#061814', '#040F0D']}
        locations={[0, 0.45, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated drifting smoke layers (atmospheric) */}
      <SmokeLayer top={height * 0.08} left={-90} size={280} duration={11000} delay={0}    tint="rgba(255,255,255,0.07)" />
      <SmokeLayer top={height * 0.32} left={width * 0.55} size={320} duration={13500} delay={2400} tint="rgba(255,245,210,0.06)" />
      <SmokeLayer top={height * 0.55} left={-70} size={360} duration={15000} delay={1400} tint="rgba(180,210,190,0.06)" />
      <SmokeLayer top={height * 0.18} left={width * 0.4} size={220} duration={9800}  delay={3700} tint="rgba(212,184,134,0.07)" />
      <SmokeLayer top={height * 0.74} left={width * 0.35} size={300} duration={12500} delay={2000} tint="rgba(255,255,255,0.05)" />
      <SmokeLayer top={height * 0.46} left={width * 0.7}  size={240} duration={10500} delay={1800} tint="rgba(212,184,134,0.05)" />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        {/* HERO ARTWORK */}
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <Image
            source={require('../../assets/images/welcome-hero.jpg')}
            style={{ width: HERO_SIZE, height: HERO_SIZE }}
            resizeMode="contain"
          />
          {/* Soft glow behind */}
          <View pointerEvents="none" style={styles.heroGlow} />
        </Animated.View>

        {/* BOTTOM CONTENT */}
        <Animated.View style={[styles.bottom, contentStyle]}>
          <Text style={styles.taglineGold}>Más allá de las apariencias…</Text>
          <Text style={styles.taglineMain}>Una conexión real{'\n'}sin máscaras.</Text>

          <TouchableOpacity
            testID="welcome-register-btn"
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/orientation')}
          >
            <LinearGradient
              colors={['#F0E0BC', '#D4B886', '#A88B4E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnPrimaryText}>Crear mi velo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            testID="welcome-login-btn"
            style={styles.btnGhost}
            activeOpacity={0.7}
            onPress={() => router.push('/(auth)/login')}
          >
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
  root: { flex: 1, backgroundColor: '#061814' },
  safe: { flex: 1, justifyContent: 'space-between' },
  heroWrap: { alignItems: 'center', justifyContent: 'center', marginTop: -8 },
  heroGlow: { position: 'absolute', width: HERO_SIZE * 0.7, height: HERO_SIZE * 0.7, borderRadius: HERO_SIZE, backgroundColor: 'rgba(212,184,134,0.06)', top: HERO_SIZE * 0.15 },
  bottom: { paddingHorizontal: 24, paddingBottom: 6 },
  taglineGold: { color: theme.cream, fontSize: 17, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 4, letterSpacing: -0.2, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  taglineMain: { color: theme.textPrimary, fontSize: 28, lineHeight: 33, fontFamily: SERIF, fontWeight: '400', letterSpacing: -0.7, marginBottom: 16, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  btnPrimary: { borderRadius: 999, paddingVertical: 17, alignItems: 'center', marginBottom: 11 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(10,38,32,0.6)', borderRadius: 999, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.55)' },
  btnGhostText: { color: theme.cream, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
