import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../../src/api';

export default function Privacy() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.h1}>Política de Privacidad</Text>
      <Text style={styles.meta}>Última actualización: Mayo 2026 · VEIL</Text>

      <Text style={styles.h2}>1. Quiénes somos</Text>
      <Text style={styles.p}>VEIL es una aplicación de citas y encuentros para adultos mayores de 18 años, dirigida a la comunidad LGBTQ+. Esta política explica qué datos recogemos, por qué y cómo los protegemos, en cumplimiento del RGPD (UE) 2016/679, LOPDGDD (España) y CCPA (California).</Text>

      <Text style={styles.h2}>2. Datos que recopilamos</Text>
      <Text style={styles.p}>• Cuenta: email, contraseña cifrada (bcrypt), nombre de visualización, edad, biografía opcional.{'\n'}• Perfil: hasta 6 fotografías opcionales e intereses.{'\n'}• Ubicación aproximada: para mostrar gente cerca. La precisión se redondea para preservar tu privacidad.{'\n'}• Actividad: mensajes, TAPs, conexiones y última actividad para mostrar estado en línea.{'\n'}• Técnicos: identificador de dispositivo (anónimo) e idioma del sistema.</Text>

      <Text style={styles.h2}>3. Datos sensibles</Text>
      <Text style={styles.p}>Tu orientación sexual y ubicación son datos especialmente protegidos por el RGPD. Solo se procesan con tu consentimiento explícito al registrarte. Puedes retirar el consentimiento en cualquier momento eliminando tu cuenta.</Text>

      <Text style={styles.h2}>4. Para qué usamos tus datos</Text>
      <Text style={styles.p}>• Para mostrarte perfiles cercanos y permitirte interactuar.{'\n'}• Para enviar y recibir mensajes y TAPs.{'\n'}• Para moderar contenido y proteger la comunidad.{'\n'}• Para cumplir obligaciones legales.{'\n'}Nunca vendemos tus datos a terceros. Nunca compartimos tu ubicación exacta.</Text>

      <Text style={styles.h2}>5. Seguridad</Text>
      <Text style={styles.p}>Las contraseñas se cifran con bcrypt. Las conexiones usan HTTPS/TLS. Implementamos mínima retención, control de acceso y auditoría. En caso de brecha, notificaremos a la autoridad y a los afectados en 72h, según el RGPD.</Text>

      <Text style={styles.h2}>6. Tus derechos</Text>
      <Text style={styles.p}>Tienes derecho a: acceder, rectificar, suprimir, portabilidad, oposición, limitación y retirar consentimiento. Puedes ejercerlos desde la app (Yo → Eliminar mi cuenta) o escribiendo a privacy@veil.app. Para reclamaciones: AEPD (España) o tu autoridad nacional.</Text>

      <Text style={styles.h2}>7. Conservación</Text>
      <Text style={styles.p}>Conservamos tus datos mientras tu cuenta esté activa. Al eliminar la cuenta, todos los datos personales se borran de forma definitiva en 30 días, excepto registros legales obligatorios anonimizados.</Text>

      <Text style={styles.h2}>8. Menores</Text>
      <Text style={styles.p}>VEIL es estrictamente para mayores de 18 años. Si detectamos un menor, eliminamos la cuenta de inmediato. Si crees que un menor tiene cuenta, repórtalo desde la app.</Text>

      <Text style={styles.h2}>9. Contacto</Text>
      <Text style={styles.p}>privacy@veil.app · DPO: dpo@veil.app{'\n'}Responsable del tratamiento: VEIL Apps.</Text>
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
