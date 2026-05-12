import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, register, saveAuth } from '../../src/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async () => {
    if (!email || !password || !name || !age) { Alert.alert('Faltan datos', 'Completa todos los campos'); return; }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18) { Alert.alert('Edad mínima', 'Debes tener al menos 18 años'); return; }
    if (password.length < 8) { Alert.alert('Contraseña', 'Mínimo 8 caracteres'); return; }
    if (!agree) { Alert.alert('Confirma', 'Debes aceptar los términos y confirmar que tienes 18+'); return; }
    setLoading(true);
    try {
      const res = await register({ email, password, name, age: ageNum, bio });
      await saveAuth(res.access_token, res.user);
      router.replace('/onboarding');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'No se pudo registrar');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top','bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity testID="register-back-btn" onPress={() => router.back()} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Crea tu{'\n'}velo.</Text>
          <Text style={styles.subtitle}>Solo lo esencial. Sin presión.</Text>

          <Text style={styles.label}>NOMBRE</Text>
          <TextInput testID="reg-name" style={styles.input} placeholder="Cómo quieres que te llamen" placeholderTextColor={theme.textSecondary} value={name} onChangeText={setName} />

          <Text style={styles.label}>EDAD</Text>
          <TextInput testID="reg-age" style={styles.input} placeholder="18+" placeholderTextColor={theme.textSecondary} keyboardType="number-pad" value={age} onChangeText={setAge} maxLength={2} />

          <Text style={styles.label}>EMAIL</Text>
          <TextInput testID="reg-email" style={styles.input} placeholder="tu@email.com" placeholderTextColor={theme.textSecondary} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />

          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput testID="reg-password" style={styles.input} placeholder="Mínimo 8 caracteres" placeholderTextColor={theme.textSecondary} secureTextEntry value={password} onChangeText={setPassword} />

          <Text style={styles.label}>SOBRE TI (OPCIONAL)</Text>
          <TextInput testID="reg-bio" style={[styles.input, { height: 90, textAlignVertical: 'top' }]} placeholder="Una breve descripción..." placeholderTextColor={theme.textSecondary} multiline maxLength={300} value={bio} onChangeText={setBio} />

          <TouchableOpacity testID="reg-agree" style={styles.agreeRow} onPress={() => setAgree(!agree)}>
            <View style={[styles.checkbox, agree && styles.checkboxOn]}>
              {agree && <Ionicons name="checkmark" size={16} color={theme.warmText} />}
            </View>
            <Text style={styles.agreeText}>
              Confirmo que tengo 18+ años y acepto los{' '}
              <Text onPress={() => router.push('/legal/terms')} style={styles.linkText}>Términos</Text>
              {' y la '}
              <Text onPress={() => router.push('/legal/privacy')} style={styles.linkText}>Política de Privacidad</Text>.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity testID="reg-submit" style={[styles.btn, !agree && { opacity: 0.5 }]} onPress={handle} disabled={loading || !agree}>
            {loading ? <ActivityIndicator color={theme.warmText} /> : <Text style={styles.btnText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: 24, paddingBottom: 40 },
  back: { width: 44, height: 44, justifyContent: 'center', marginLeft: -10, marginBottom: 12 },
  title: { color: theme.textPrimary, fontSize: 40, lineHeight: 44, fontWeight: '300', letterSpacing: -1.5, marginBottom: 8 },
  subtitle: { color: theme.textSecondary, fontSize: 16, marginBottom: 28 },
  label: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8, marginTop: 14 },
  input: { backgroundColor: theme.surface1, borderRadius: 16, padding: 16, color: theme.textPrimary, fontSize: 16 },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: theme.textSecondary, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxOn: { backgroundColor: theme.warm, borderColor: theme.warm },
  agreeText: { color: theme.textSecondary, fontSize: 13, lineHeight: 18, flex: 1 },
  linkText: { color: theme.cream, fontWeight: '600', textDecorationLine: 'underline' },
  btn: { backgroundColor: theme.warm, borderRadius: 24, paddingVertical: 18, alignItems: 'center', marginTop: 24 },
  btnText: { color: theme.warmText, fontSize: 16, fontWeight: '600' },
});
