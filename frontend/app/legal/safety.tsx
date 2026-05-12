import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/api';

const TIPS = [
  { icon: 'shield-checkmark', title: 'Protege tu identidad', text: 'No compartas apellidos, dirección, lugar de trabajo o información financiera hasta tener confianza real.' },
  { icon: 'location', title: 'Quedadas seguras', text: 'Primera cita en lugar público, con gente alrededor. Avísale a un amigo y comparte tu ubicación en tiempo real.' },
  { icon: 'eye-off', title: 'Sin presión', text: 'Nadie debe presionarte a enviar fotos, encontrarte o hacer cosas con las que no estés cómodo. Un "no" es un "no". Punto.' },
  { icon: 'wine', title: 'Cuida tu bebida', text: 'Si quedas en un local, no dejes tu bebida sin vigilancia. Si te sientes raro, pide ayuda al personal de inmediato.' },
  { icon: 'card', title: 'Sin dinero por adelantado', text: 'Ningún match legítimo te pedirá dinero. Si alguien te pide transferencia, criptomoneda o regalos antes de conocerte, repórtalo.' },
  { icon: 'flag', title: 'Reporta sin miedo', text: 'Tu reporte es anónimo. Si algo te incomoda, no esperes. Bloquea + Reporta = tu primera defensa.' },
  { icon: 'happy', title: 'Tu salud mental importa', text: 'Si las conexiones online te están afectando, haz una pausa. VEIL estará aquí cuando vuelvas.' },
];

const HOTLINES = [
  { country: '🇪🇸 España', name: 'COGAM · Asistencia LGBTQ+', value: '91 522 45 17' },
  { country: '🇪🇸 España', name: 'Emergencias', value: '112' },
  { country: '🇲🇽 México', name: 'It Gets Better MX', value: 'itgetsbetter.mx' },
  { country: '🌎 Internacional', name: 'The Trevor Project (24/7, ES)', value: 'thetrevorproject.mx' },
];

export default function Safety() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.h1}>Centro de Seguridad</Text>
      <Text style={styles.meta}>Tu bienestar es lo primero. Aquí van consejos esenciales para tu protección.</Text>

      {TIPS.map((tip, i) => (
        <View key={i} style={styles.tip}>
          <View style={styles.tipIcon}>
            <Ionicons name={tip.icon as any} size={20} color={theme.cream} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.h2}>📞 Líneas de ayuda</Text>
      <Text style={styles.p}>Si te encuentras en peligro o necesitas apoyo emocional, no dudes en llamar:</Text>
      {HOTLINES.map((h, i) => (
        <View key={i} style={styles.hotline}>
          <Text style={styles.hotlineCountry}>{h.country}</Text>
          <Text style={styles.hotlineName}>{h.name}</Text>
          <Text style={styles.hotlineValue}>{h.value}</Text>
        </View>
      ))}

      <Text style={styles.h2}>⚠️ Emergencia</Text>
      <Text style={styles.p}>Si tu vida o la de alguien está en peligro inmediato, llama PRIMERO al servicio de emergencias de tu país (112 en Europa, 911 en EE.UU., 911 en LATAM). Después puedes reportárnoslo a safety@veil.app.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: -0.5, marginBottom: 8 },
  meta: { color: theme.textSecondary, fontSize: 13, marginBottom: 24, lineHeight: 19 },
  h2: { color: theme.cream, fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 10 },
  p: { color: theme.textPrimary, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  tip: { flexDirection: 'row', gap: 12, padding: 14, backgroundColor: theme.surface1, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.border },
  tipIcon: { width: 40, height: 40, borderRadius: 999, backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  tipText: { color: theme.textSecondary, fontSize: 13, lineHeight: 19 },
  hotline: { backgroundColor: theme.surface1, padding: 12, borderRadius: 12, marginBottom: 8 },
  hotlineCountry: { color: theme.cream, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  hotlineName: { color: theme.textPrimary, fontSize: 14, marginTop: 4 },
  hotlineValue: { color: theme.textSecondary, fontSize: 13, marginTop: 2 },
});
