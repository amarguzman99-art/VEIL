import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '../../src/api';

const { width, height } = Dimensions.get('window');
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export default function Welcome() {
  const router = useRouter();
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { duration: 1200 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({ opacity: fadeIn.value }));

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/images/welcome-bg.png')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Subtle dark overlay to ensure text legibility on bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(6,24,20,0.4)', 'rgba(4,15,12,0.95)']}
          locations={[0.55, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
          {/* Top: just the 18+ chip (logo is in the background image) */}
          <View style={styles.top}>
            <View style={styles.ageBadge}><Text style={styles.ageBadgeText}>18+</Text></View>
          </View>

          <View style={styles.middle} />

          {/* Bottom: dynamic text + buttons */}
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 12 },
  ageBadge: { borderWidth: 1, borderColor: 'rgba(212,184,134,0.55)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(10,38,32,0.5)' },
  ageBadgeText: { color: theme.cream, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  middle: { flex: 1 },
  bottom: { paddingBottom: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  ornamentLine: { flex: 1, height: 1, backgroundColor: 'rgba(212,184,134,0.35)' },
  preTagline: { color: theme.cream, fontSize: 10, fontWeight: '700', letterSpacing: 2.6 },
  taglineGold: { color: theme.cream, fontSize: 20, fontFamily: SERIF, fontStyle: 'italic', marginBottom: 6, letterSpacing: -0.3 },
  taglineMain: { color: theme.textPrimary, fontSize: 34, lineHeight: 40, fontFamily: SERIF, fontWeight: '400', letterSpacing: -1, marginBottom: 14 },
  subtitle: { color: theme.textSecondary, fontSize: 14.5, lineHeight: 21, marginBottom: 24, fontStyle: 'italic' },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowColor: '#D4B886', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 24, elevation: 14 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  btnGhost: { backgroundColor: 'rgba(10,38,32,0.4)', borderRadius: 999, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.5)' },
  btnGhostText: { color: theme.cream, fontSize: 15, fontWeight: '500' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
