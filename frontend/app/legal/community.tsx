import { Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../src/api';

export default function Community() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.h1}>Normas de Comunidad</Text>
      <Text style={styles.meta}>VEIL es un espacio seguro y respetuoso.</Text>

      <Text style={styles.h2}>✦ Lo que celebramos</Text>
      <Text style={styles.p}>• Conexiones reales y respetuosas{'\n'}• Comunicación honesta y consentida{'\n'}• Diversidad de cuerpos, edades y experiencias{'\n'}• Curiosidad sin prejuicios{'\n'}• Identidad LGBTQ+ libre y orgullosa</Text>

      <Text style={styles.h2}>✦ Lo que NO se permite</Text>
      <Text style={styles.p}>• Acoso, amenazas, intimidación o discurso de odio{'\n'}• Racismo, transfobia, sero-fobia, edadismo o cuerpofobia{'\n'}• Desnudos explícitos, pornografía o actos sexuales gráficos{'\n'}• Solicitud o oferta de servicios sexuales pagados, escorts, prostitución{'\n'}• Promoción de drogas, chemsex o sustancias ilegales{'\n'}• Spam, scams, phishing o suplantación de identidad{'\n'}• Fotos sin consentimiento o material de terceros{'\n'}• Cualquier contenido que involucre a menores de 18 años{'\n'}• Doxxing, filtración de datos personales o ubicación</Text>

      <Text style={styles.h2}>✦ Buenas prácticas</Text>
      <Text style={styles.p}>• Pide consentimiento antes de enviar fotos íntimas{'\n'}• Respeta los "no" — sin insistir{'\n'}• Si vas a quedar en persona, hazlo primero en lugar público{'\n'}• Cuéntale a alguien de confianza dónde estarás{'\n'}• Confía en tu intuición — si algo te incomoda, bloquea y reporta</Text>

      <Text style={styles.h2}>✦ Consecuencias</Text>
      <Text style={styles.p}>Las violaciones pueden resultar en advertencia, ocultación de contenido, suspensión temporal o eliminación permanente de la cuenta. En casos graves, denunciaremos a las autoridades competentes.</Text>

      <Text style={styles.h2}>✦ Cómo reportar</Text>
      <Text style={styles.p}>Toca el menú "···" en cualquier perfil o conversación → Reportar. Elige la categoría que mejor describa el problema. Nuestro equipo revisa todos los reportes en menos de 24h. La identidad del que reporta se mantiene confidencial.</Text>

      <Text style={styles.h2}>✦ Contacto urgente</Text>
      <Text style={styles.p}>safety@veil.app · Para situaciones de emergencia, contacta SIEMPRE primero a las autoridades locales (112 en Europa, 911 en EE.UU.).</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: -0.5, marginBottom: 8 },
  meta: { color: theme.textSecondary, fontSize: 13, marginBottom: 24, fontStyle: 'italic' },
  h2: { color: theme.cream, fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  p: { color: theme.textPrimary, fontSize: 14, lineHeight: 22 },
});
