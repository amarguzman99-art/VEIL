import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const router = useRouter();
  const pulse = useSharedValue(1);
  const float = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) })), -1);
    float.value = withRepeat(withSequence(withTiming(-8, { duration: 2800, easing: Easing.inOut(Easing.quad) }), withTiming(8, { duration: 2800, easing: Easing.inOut(Easing.quad) })), -1);
  }, []);

  const diamondStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { translateY: float.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 1.1 }],
    opacity: 0.5 + (pulse.value - 1) * 3,
  }));

  return (
    <View style={styles.root}>
      {/* Layered violet/black silk background */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1760224254117-7a40f7f03fe2?w=1200&q=80' }}
        style={StyleSheet.absoluteFill}
        blurRadius={2}
      />
      <LinearGradient
        colors={['rgba(124,58,237,0.45)', 'rgba(10,4,24,0.85)', '#0A0418']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Decorative glow blobs */}
      <View style={[styles.blob, { top: -80, left: -60, backgroundColor: '#7C3AED' }]} />
      <View style={[styles.blob, { bottom: 120, right: -80, backgroundColor: '#F5B642', opacity: 0.18 }]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        {/* Header */}
        <View style={styles.top}>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>VEIL</Text>
            <View style={styles.dot} />
          </View>
          <Text style={styles.caption}>18+ · LGBTQ+</Text>
        </View>

        {/* Center diamond glow */}
        <View style={styles.middle}>
          <Animated.View style={[styles.halo, haloStyle]} />
          <Animated.View style={[styles.diamondWrap, diamondStyle]}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_hola-hello-496/artifacts/j1biqbam_IMG_3825.jpeg' }}
              style={styles.diamond}
            />
          </Animated.View>
        </View>

        {/* Bottom content */}
        <View style={styles.bottom}>
          <Text style={styles.preTagline}>DESCUBRE LO QUE HAY DETRÁS</Text>
          <Text style={styles.tagline}>
            <Text style={{ color: theme.textPrimary }}>Levanta el </Text>
            <Text style={styles.taglineGold}>velo.</Text>
            {'\n'}
            <Text style={{ color: theme.textPrimary }}>Encuentra tu </Text>
            <Text style={styles.taglineGold}>fuego.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Conexiones reales. Sin máscaras. Cerca de ti.
          </Text>

          <TouchableOpacity
            testID="welcome-register-btn"
            activeOpacity={0.85}
            onPress={() => router.push('/(auth)/register')}
          >
            <LinearGradient
              colors={['#FFD27A', '#F5B642', '#E89B1F']}
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
            <Text style={styles.btnGhostText}>Ya tengo cuenta</Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            Al continuar aceptas tener 18+ años, los Términos y la Política de Privacidad.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, overflow: 'hidden' },
  blob: { position: 'absolute', width: 280, height: 280, borderRadius: 999, opacity: 0.35, transform: [{ scale: 1.3 }] },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { color: theme.textPrimary, fontSize: 26, fontWeight: '300', letterSpacing: 8 },
  dot: { width: 7, height: 7, backgroundColor: theme.gold, borderRadius: 999 },
  caption: { color: theme.textSecondary, fontSize: 10, letterSpacing: 1.6, fontWeight: '700' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  halo: { position: 'absolute', width: width * 0.7, height: width * 0.7, borderRadius: 999, backgroundColor: '#7C3AED', opacity: 0.35 },
  diamondWrap: { width: width * 0.55, height: width * 0.55, alignItems: 'center', justifyContent: 'center' },
  diamond: { width: '100%', height: '100%', borderRadius: 999, resizeMode: 'cover' },
  bottom: { paddingBottom: 8 },
  preTagline: { color: theme.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2.4, marginBottom: 14 },
  tagline: { fontSize: 42, lineHeight: 46, fontWeight: '300', letterSpacing: -1.5, marginBottom: 14 },
  taglineGold: { color: theme.gold, fontStyle: 'italic', fontWeight: '400' },
  subtitle: { color: theme.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 28 },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#F5B642', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  btnPrimaryText: { color: '#1A0E04', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: 999, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)' },
  btnGhostText: { color: theme.textPrimary, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textSecondary, fontSize: 10.5, textAlign: 'center', marginTop: 18, lineHeight: 16, opacity: 0.7 },
});
