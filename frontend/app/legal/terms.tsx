import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../src/api';

export default function Terms() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.h1}>Términos de Servicio</Text>
      <Text style={styles.meta}>Última actualización: Mayo 2026 · VEIL</Text>

      <Text style={styles.h2}>1. Aceptación</Text>
      <Text style={styles.p}>Al registrarte en VEIL aceptas estos Términos y nuestra Política de Privacidad. Si no estás de acuerdo, no uses el servicio.</Text>

      <Text style={styles.h2}>2. Edad mínima</Text>
      <Text style={styles.p}>Debes tener 18 años cumplidos. Al registrarte confirmas legalmente tu mayoría de edad. Si descubrimos que eres menor, eliminaremos tu cuenta inmediatamente y podríamos notificar a las autoridades.</Text>

      <Text style={styles.h2}>3. Cuenta</Text>
      <Text style={styles.p}>Eres responsable de la seguridad de tu cuenta. No compartas tu contraseña. Usa información veraz. Una persona, una cuenta.</Text>

      <Text style={styles.h2}>4. Uso aceptable</Text>
      <Text style={styles.p}>Está prohibido: acosar, amenazar, suplantar identidad, publicar contenido sexual explícito, pornografía, desnudos, prostitución, escorts, drogas, chemsex, contenido con menores, contenido violento, discriminatorio o ilegal. También está prohibido el spam, el phishing, el scraping y el uso comercial no autorizado.</Text>

      <Text style={styles.h2}>5. Moderación</Text>
      <Text style={styles.p}>Nos reservamos el derecho a moderar, ocultar, eliminar contenido o cuentas que violen los Términos o las Normas de Comunidad, sin previo aviso. Las decisiones se basan en revisión humana y/o automatizada.</Text>

      <Text style={styles.h2}>6. Responsabilidad del usuario</Text>
      <Text style={styles.p}>Eres totalmente responsable de tus interacciones con otros usuarios. VEIL no garantiza la identidad ni las intenciones de otros. Reúnete en lugares públicos, informa a un amigo y usa el sentido común.</Text>

      <Text style={styles.h2}>7. Premium e In-App Purchases</Text>
      <Text style={styles.p}>Las suscripciones Premium se procesan mediante App Store (Apple) o Google Play. Se renuevan automáticamente salvo cancelación con 24h de antelación. La gestión y reembolsos se realizan según las políticas de la plataforma.</Text>

      <Text style={styles.h2}>8. Propiedad intelectual</Text>
      <Text style={styles.p}>VEIL, su logotipo, diseño y software son propiedad de VEIL Apps. Tus fotos y contenido siguen siendo tuyos; nos concedes una licencia limitada para mostrarlos dentro del servicio.</Text>

      <Text style={styles.h2}>9. Terminación</Text>
      <Text style={styles.p}>Puedes eliminar tu cuenta en cualquier momento (Yo → Eliminar mi cuenta). Podemos suspender o cerrar cuentas que violen los Términos. El borrado es real, definitivo y irreversible.</Text>

      <Text style={styles.h2}>10. Limitación de responsabilidad</Text>
      <Text style={styles.p}>El servicio se proporciona "tal cual". No garantizamos resultados específicos. Nuestra responsabilidad máxima está limitada a lo pagado por suscripción en los últimos 12 meses.</Text>

      <Text style={styles.h2}>11. Ley aplicable</Text>
      <Text style={styles.p}>Estos Términos se rigen por la legislación española y, en su caso, la UE. Las disputas se someterán a los tribunales de Madrid, salvo derechos imperativos del consumidor.</Text>

      <Text style={styles.h2}>12. Contacto</Text>
      <Text style={styles.p}>support@veil.app · legal@veil.app</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.textPrimary, fontSize: 28, fontWeight: '300', letterSpacing: -0.5, marginBottom: 8 },
  meta: { color: theme.textSecondary, fontSize: 12, marginBottom: 24 },
  h2: { color: theme.cream, fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  p: { color: theme.textPrimary, fontSize: 14, lineHeight: 22 },
});
