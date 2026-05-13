import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/api';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const ORIENTATIONS = [
  { id: 'man_seeks_woman', icon: '👨', icon2: '👩', label: 'Chico busca chica', i_am: 'man', looking: 'woman' },
  { id: 'woman_seeks_man', icon: '👩', icon2: '👨', label: 'Chica busca chico', i_am: 'woman', looking: 'man' },
  { id: 'man_seeks_man', icon: '👨', icon2: '👨', label: 'Chico busca chico', i_am: 'man', looking: 'man' },
  { id: 'woman_seeks_woman', icon: '👩', icon2: '👩', label: 'Chica busca chica', i_am: 'woman', looking: 'woman' },
];

export default function Orientation() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const next = () => {
    const choice = ORIENTATIONS.find(o => o.id === selected);
    if (!choice) return;
    router.push({ pathname: '/(auth)/register', params: { gender: choice.i_am, looking_for: choice.looking } });
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require('../../assets/images/smoke-bg.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient colors={['rgba(20,58,48,0.45)', 'rgba(6,24,20,0.95)']} locations={[0, 1]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.safe} edges={['top','bottom']}>
          <View style={styles.top}>
            <TouchableOpacity testID="ori-back-btn" onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.middle}>
            <Text style={styles.preTitle}>UN PRIMER PASO</Text>
            <Text style={styles.title}>¿Cómo te{'\n'}identificas?</Text>
            <Text style={styles.subtitle}>Esto solo afecta a quién verás. Cero etiquetas, total respeto.</Text>

            <View style={styles.options}>
              {ORIENTATIONS.map(o => (
                <TouchableOpacity
                  key={o.id}
                  testID={`ori-${o.id}`}
                  style={[styles.option, selected === o.id && styles.optionSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelected(o.id)}
                >
                  <View style={styles.iconRow}>
                    <Text style={styles.emoji}>{o.icon}</Text>
                    <Ionicons name="heart" size={14} color={selected === o.id ? theme.warmText : theme.cream} />
                    <Text style={styles.emoji}>{o.icon2}</Text>
                  </View>
                  <Text style={[styles.optionLabel, selected === o.id && styles.optionLabelOn]}>{o.label}</Text>
                  {selected === o.id && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={14} color={theme.warmText} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity testID="ori-continue" activeOpacity={0.85} onPress={next} disabled={!selected}>
              <LinearGradient
                colors={selected ? ['#F0E0BC', '#D4B886', '#A88B4E'] : ['#3A4A40', '#2A3A30', '#1F2A24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btn}
              >
                <Text style={[styles.btnText, !selected && { color: theme.textMuted }]}>Continuar</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.legal}>Podrás ajustarlo después en tu perfil.</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  safe: { flex: 1, paddingHorizontal: 24 },
  top: { paddingTop: 8 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', marginLeft: -10 },
  middle: { flex: 1, justifyContent: 'center' },
  preTitle: { color: theme.cream, fontSize: 11, letterSpacing: 2.4, fontWeight: '700', marginBottom: 10 },
  title: { color: theme.textPrimary, fontSize: 38, lineHeight: 42, fontFamily: SERIF, fontWeight: '400', letterSpacing: -1.2, marginBottom: 10 },
  subtitle: { color: theme.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 30, fontStyle: 'italic' },
  options: { gap: 10 },
  option: { backgroundColor: 'rgba(15,46,39,0.7)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 16, position: 'relative' },
  optionSelected: { backgroundColor: theme.cream, borderColor: theme.cream },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji: { fontSize: 22 },
  optionLabel: { color: theme.textPrimary, fontSize: 15, fontWeight: '600', flex: 1 },
  optionLabelOn: { color: theme.warmText },
  checkmark: { width: 26, height: 26, borderRadius: 999, backgroundColor: theme.warmText, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingBottom: 12 },
  btn: { borderRadius: 999, paddingVertical: 18, alignItems: 'center' },
  btnText: { color: theme.warmText, fontSize: 16, fontWeight: '700' },
  legal: { color: theme.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12 },
});
