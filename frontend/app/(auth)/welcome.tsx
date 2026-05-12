import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, withDelay } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width } = Dimensions.get('window');
const EMBLEM = width * 0.62;

// Stylized mask emblem rendered as pure SVG paths (resolution-independent)
function MaskEmblem({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Defs>
        <SvgGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE4A3" />
          <Stop offset="0.5" stopColor="#F5B642" />
          <Stop offset="1" stopColor="#C97E0E" />
        </SvgGradient>
        <SvgGradient id="goldRim" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD27A" />
          <Stop offset="1" stopColor="#A86A0A" />
        </SvgGradient>
        <SvgGradient id="violetGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#A78BFA" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#5B21B6" stopOpacity="0.2" />
        </SvgGradient>
      </Defs>

      {/* Outer violet halo */}
      <Circle cx="100" cy="100" r="90" fill="url(#violetGrad)" />

      {/* Decorative thin gold circle */}
      <Circle cx="100" cy="100" r="78" fill="none" stroke="url(#goldRim)" strokeWidth="0.8" opacity="0.4" />

      {/* Venetian mask shape - top arches over eyes */}
      <G>
        {/* Mask body - wide horizontal with rounded sides, dipped center */}
        <Path
          d="M 30 100
             C 30 78, 50 70, 75 72
             C 88 73, 95 80, 100 88
             C 105 80, 112 73, 125 72
             C 150 70, 170 78, 170 100
             C 170 118, 155 130, 135 130
             C 120 130, 110 122, 105 115
             C 102 112, 100 110, 100 110
             C 100 110, 98 112, 95 115
             C 90 122, 80 130, 65 130
             C 45 130, 30 118, 30 100 Z"
          fill="url(#goldGrad)"
          stroke="#5C3A09"
          strokeWidth="1.2"
        />

        {/* Left eye - almond shape, slanted */}
        <Path
          d="M 50 99
             C 52 88, 65 84, 78 88
             C 86 90, 89 96, 87 101
             C 84 108, 70 111, 58 107
             C 51 105, 48 102, 50 99 Z"
          fill="#0A0418"
        />

        {/* Right eye - almond shape, slanted */}
        <Path
          d="M 113 101
             C 111 96, 114 90, 122 88
             C 135 84, 148 88, 150 99
             C 152 102, 149 105, 142 107
             C 130 111, 116 108, 113 101 Z"
          fill="#0A0418"
        />

        {/* Decorative dots above eyes (gold studs) */}
        <Circle cx="68" cy="80" r="1.8" fill="#FFE4A3" />
        <Circle cx="100" cy="78" r="2.2" fill="#FFE4A3" />
        <Circle cx="132" cy="80" r="1.8" fill="#FFE4A3" />

        {/* Subtle highlight on mask top */}
        <Path
          d="M 50 85 C 70 78, 90 76, 100 82 C 110 76, 130 78, 150 85"
          fill="none"
          stroke="#FFE4A3"
          strokeWidth="0.8"
          opacity="0.5"
        />
      </G>

      {/* Faint silk swirl behind mask (decorative ribbon) */}
      <Path
        d="M 20 60 Q 60 30, 100 50 Q 140 70, 180 40"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <Path
        d="M 20 150 Q 60 170, 100 155 Q 140 140, 180 160"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="1.5"
        opacity="0.5"
      />
    </Svg>
  );
}

export default function Welcome() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const float = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 800 });
    pulse.value = withRepeat(withSequence(withTiming(1.04, { duration: 2400, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) })), -1);
    float.value = withRepeat(withSequence(withTiming(-6, { duration: 3000, easing: Easing.inOut(Easing.quad) }), withTiming(6, { duration: 3000, easing: Easing.inOut(Easing.quad) })), -1);
  }, []);

  const emblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: float.value }],
    opacity: fadeIn.value,
  }));
  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 1.15 }],
    opacity: fadeIn.value * (0.35 + (pulse.value - 1) * 6),
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      {/* Layered gradient background */}
      <LinearGradient
        colors={['#1A0B33', '#0A0418', '#0A0418']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Radial-like soft glow blobs */}
      <View style={[styles.blob, { top: -60, left: -80, backgroundColor: '#7C3AED', opacity: 0.35 }]} />
      <View style={[styles.blob, { top: 120, right: -120, backgroundColor: '#5B21B6', opacity: 0.25, width: 360, height: 360 }]} />
      <View style={[styles.blob, { bottom: 200, left: -90, backgroundColor: '#F5B642', opacity: 0.10, width: 280, height: 280 }]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        {/* Header */}
        <View style={styles.top}>
          <View style={styles.logoRow}>
            <Text style={styles.logoMark}>V</Text>
            <Text style={styles.logo}>EIL</Text>
            <View style={styles.dot} />
          </View>
          <Text style={styles.caption}>18+ · LGBTQ+</Text>
        </View>

        {/* Center emblem */}
        <View style={styles.middle}>
          <Animated.View style={[styles.halo, haloStyle]} />
          <Animated.View style={[styles.emblem, emblemStyle]}>
            <MaskEmblem size={EMBLEM} />
          </Animated.View>
        </View>

        {/* Bottom content */}
        <Animated.View style={[styles.bottom, contentStyle]}>
          <View style={styles.ornamentRow}>
            <View style={styles.ornamentLine} />
            <Text style={styles.preTagline}>DESCUBRE LO QUE HAY DETRÁS</Text>
            <View style={styles.ornamentLine} />
          </View>
          <Text style={styles.tagline}>
            <Text style={{ color: theme.textPrimary }}>Levanta el </Text>
            <Text style={styles.taglineGold}>velo.</Text>
            {'\n'}
            <Text style={{ color: theme.textPrimary }}>Encuentra tu </Text>
            <Text style={styles.taglineGold}>fuego.</Text>
          </Text>
          <Text style={styles.subtitle}>Conexiones reales. Sin máscaras. Cerca de ti.</Text>

          <TouchableOpacity testID="welcome-register-btn" activeOpacity={0.85} onPress={() => router.push('/(auth)/register')}>
            <LinearGradient
              colors={['#FFE4A3', '#F5B642', '#C97E0E']}
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
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 999 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoMark: { color: theme.gold, fontSize: 26, fontWeight: '700', letterSpacing: 2, fontStyle: 'italic' },
  logo: { color: theme.textPrimary, fontSize: 26, fontWeight: '300', letterSpacing: 8 },
  dot: { width: 6, height: 6, backgroundColor: theme.gold, borderRadius: 999, marginLeft: 8 },
  caption: { color: theme.textSecondary, fontSize: 10, letterSpacing: 1.6, fontWeight: '700' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: EMBLEM * 1.4, height: EMBLEM * 1.4, borderRadius: 999, backgroundColor: '#7C3AED' },
  emblem: { width: EMBLEM, height: EMBLEM, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingBottom: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(245,182,66,0.25)' },
  preTagline: { color: theme.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2.4 },
  tagline: { fontSize: 42, lineHeight: 46, fontWeight: '300', letterSpacing: -1.5, marginBottom: 14 },
  taglineGold: { color: theme.gold, fontStyle: 'italic', fontWeight: '400' },
  subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 28 },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#F5B642', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 14 },
  btnPrimaryText: { color: '#1A0E04', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: 999, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)' },
  btnGhostText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textSecondary, fontSize: 10.5, textAlign: 'center', marginTop: 18, lineHeight: 16, opacity: 0.7 },
});
