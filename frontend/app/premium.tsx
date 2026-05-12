import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/api';

const FEATURES = [
  { icon: 'checkmark-done', color: theme.blueArrow, title: 'Flechas azules', desc: 'Sabe quién leyó tus mensajes en el instante.' },
  { icon: 'eye', color: theme.gold, title: 'Quién te ha dado TAP', desc: 'Descubre todos los que te enviaron una señal.' },
  { icon: 'options', color: theme.warm, title: 'Filtros avanzados', desc: 'Edad, intereses, distancia exacta y más.' },
  { icon: 'shield-checkmark', color: '#4ADE80', title: 'Modo incógnito', desc: 'Navega sin aparecer en la rejilla.' },
  { icon: 'sparkles', color: theme.violet, title: 'Boost de visibilidad', desc: 'Tu perfil al top durante 30 minutos.' },
  { icon: 'infinite', color: theme.gold, title: 'TAPs ilimitados', desc: 'Sin esperas. Sin restricciones.' },
];

export default function Premium() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <LinearGradient colors={['rgba(133,68,181,0.25)', theme.bg]} style={styles.gradientTop} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.hero}>
            <View style={styles.diamondWrap}>
              <Ionicons name="diamond" size={64} color={theme.violet} />
            </View>
            <Text style={styles.title}>VEIL{'\n'}Premium</Text>
            <Text style={styles.subtitle}>Descubre lo que hay detrás del velo.</Text>
          </View>
          <View style={styles.list}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.feature}>
                <View style={[styles.iconBox, { backgroundColor: `${f.color}22` }]}>
                  <Ionicons name={f.icon as any} size={22} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.pricing}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>1 MES</Text>
              <Text style={styles.price}>9,99 €</Text>
              <Text style={styles.priceSub}>renovación mensual</Text>
            </View>
            <View style={[styles.priceCard, styles.priceCardHot]}>
              <View style={styles.badge}><Text style={styles.badgeText}>POPULAR</Text></View>
              <Text style={styles.priceLabel}>12 MESES</Text>
              <Text style={styles.price}>4,99 €</Text>
              <Text style={styles.priceSub}>al mes · 59,88 €/año</Text>
            </View>
          </View>
          <TouchableOpacity testID="premium-cta" style={styles.cta} onPress={() => Alert.alert('Próximamente', 'Las suscripciones estarán disponibles en breve mediante App Store.')}>
            <Text style={styles.ctaText}>Activar Premium</Text>
          </TouchableOpacity>
          <Text style={styles.legal}>Próximamente. Los pagos se procesarán mediante las suscripciones de Apple App Store.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 320 },
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: theme.surface1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
  diamondWrap: { width: 120, height: 120, borderRadius: 999, backgroundColor: 'rgba(133,68,181,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', marginBottom: 24 },
  title: { color: theme.textPrimary, fontSize: 42, lineHeight: 46, fontWeight: '300', letterSpacing: -1.5, textAlign: 'center' },
  subtitle: { color: theme.textSecondary, fontSize: 16, marginTop: 12, textAlign: 'center' },
  list: { paddingHorizontal: 20, gap: 14 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surface1, padding: 16, borderRadius: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
  featureDesc: { color: theme.textSecondary, fontSize: 13, marginTop: 2 },
  pricing: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 28 },
  priceCard: { flex: 1, backgroundColor: theme.surface1, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: theme.border, position: 'relative' },
  priceCardHot: { borderColor: theme.gold },
  badge: { position: 'absolute', top: -10, backgroundColor: theme.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: '#1A1410', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  priceLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  price: { color: theme.textPrimary, fontSize: 26, fontWeight: '300', marginTop: 8 },
  priceSub: { color: theme.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },
  cta: { backgroundColor: theme.warm, marginHorizontal: 20, marginTop: 24, paddingVertical: 18, borderRadius: 24, alignItems: 'center' },
  ctaText: { color: theme.warmText, fontSize: 16, fontWeight: '600' },
  legal: { color: theme.textSecondary, fontSize: 11, textAlign: 'center', paddingHorizontal: 32, marginTop: 16, lineHeight: 16 },
});
