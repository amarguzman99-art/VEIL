import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, login, saveAuth } from '../../src/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Faltan datos', 'Email y contraseña requeridos'); return; }
    setLoading(true);
    try {
      const res = await login({ email, password });
      await saveAuth(res.access_token, res.user);
      router.replace('/(tabs)/grid');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'No se pudo iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="login-back-btn" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Bienvenido{'\n'}de vuelta.</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              testID="login-email-input"
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              testID="login-password-input"
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity testID="login-submit-btn" style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={theme.warmText} /> : <Text style={styles.btnText}>Entrar</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={styles.link}>¿No tienes cuenta? <Text style={{ color: theme.warm }}>Regístrate</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 24, flexGrow: 1 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -10, marginBottom: 12 },
  title: { color: theme.textPrimary, fontSize: 40, lineHeight: 44, fontWeight: '300', letterSpacing: -1.5, marginBottom: 8 },
  subtitle: { color: theme.textSecondary, fontSize: 16, marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  input: { backgroundColor: theme.surface1, borderRadius: 16, padding: 16, color: theme.textPrimary, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
  btn: { backgroundColor: theme.warm, borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 16 },
  btnText: { color: theme.warmText, fontSize: 16, fontWeight: '600' },
  link: { color: theme.textSecondary, fontSize: 14 },
});
