import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/api';

export default function Welcome() {
  const router = useRouter();
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1760224254117-7a40f7f03fe2?w=1200' }}
      style={styles.bg}
    >
      <LinearGradient colors={['rgba(11,8,17,0.4)', theme.bg]} style={styles.overlay}>
        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
          <View style={styles.top}>
            <Text style={styles.logo}>VEIL</Text>
            <View style={styles.dot} />
          </View>
          <View style={styles.bottom}>
            <Text style={styles.tagline}>Un velo que{'\n'}se destapa.</Text>
            <Text style={styles.subtitle}>
              Conoce gente real cerca de ti. Sin filtros. Sin máscaras.
            </Text>
            <TouchableOpacity
              testID="welcome-register-btn"
              style={styles.btnPrimary}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="welcome-login-btn"
              style={styles.btnGhost}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.btnGhostText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
            <Text style={styles.legal}>
              Al continuar aceptas que tienes 18+ años, los Términos y la Política de Privacidad.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: theme.bg },
  overlay: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 20 },
  logo: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: 8 },
  dot: { width: 8, height: 8, backgroundColor: theme.warm, borderRadius: 999 },
  bottom: { paddingBottom: 12 },
  tagline: { color: theme.textPrimary, fontSize: 44, lineHeight: 48, fontWeight: '300', letterSpacing: -1.5, marginBottom: 16 },
  subtitle: { color: theme.textSecondary, fontSize: 16, lineHeight: 24, marginBottom: 32 },
  btnPrimary: { backgroundColor: theme.warm, borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '600', letterSpacing: 0.3 },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  btnGhostText: { color: theme.textPrimary, fontSize: 16, fontWeight: '500' },
  legal: { color: theme.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16 },
});
