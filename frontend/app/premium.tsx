import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/api';

const FEATURES = [
  { icon: 'flame', color: '#FF7B54', title: 'Ver quién te ha dado TAP', desc: 'Descubre todos los 🔥💜💋 que has recibido. Sin secretos.' },
  { icon: 'checkmark-done', color: '#7DD3FC', title: 'Flechas azules · Confirmación de lectura', desc: 'Sabe al instante quién ha leído tus mensajes.' },
  { icon: 'flash', color: '#FBBF24', title: 'Boost de popularidad · 1 hora', desc: 'Tu perfil al top de la zona durante 60 minutos.' },
  { icon: 'compass', color: '#A78BFA', title: 'Expandir distancia', desc: 'Lo cercano es gratis. Con Premium, llega más lejos.' },
  { icon: 'images', color: '#F472B6', title: '6 fotos en tu perfil', desc: 'Muestra todas tus facetas. Sin límites.' },
  { icon: 'options', color: '#34D399', title: 'Filtros avanzados', desc: 'Edad exacta, intereses, online ahora, premium, etc.' },
  { icon: 'eye-off', color: '#94A3B8', title: 'Modo incógnito', desc: 'Navega sin aparecer en la rejilla de nadie.' },
  { icon: 'infinite', color: theme.cream, title: 'TAPs ilimitados', desc: 'Sin esperas. Envía cuantos quieras, cuando quieras.' },
];

export default function Premium() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B1273', '#1A0938', theme.bg]} locations={[0, 0.4, 1]} style={styles.gradientTop} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.navRow}>
          <TouchableOpacity testID="premium-close-btn" onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/images/icon.png')} style={styles.logoImg} />
            </View>
            <Text style={styles.title}>VEIL{'\n'}Premium</Text>
            <Text style={styles.subtitle}>Descubre lo que hay detrás del velo.</Text>
          </View>

          <View style={styles.list}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.feature}>
                <View style={[styles.iconBox, { backgroundColor: `${f.color}20` }]}>
                  <Ionicons name={f.icon as any} size={20} color={f.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pricing}>
            <TouchableOpacity style={styles.priceCard} activeOpacity={0.8}>
              <Text style={styles.priceLabel}>1 SEMANA</Text>
              <Text style={styles.price}>4,99 €</Text>
              <Text style={styles.priceSub}>prueba</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.priceCard, styles.priceCardHot]} activeOpacity={0.8}>
              <View style={styles.badge}><Text style={styles.badgeText}>POPULAR</Text></View>
              <Text style={styles.priceLabel}>1 MES</Text>
              <Text style={styles.price}>9,99 €</Text>
              <Text style={styles.priceSub}>renovación mensual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.priceCard} activeOpacity={0.8}>
              <View style={[styles.badge, { backgroundColor: theme.violet }]}><Text style={[styles.badgeText, { color: '#fff' }]}>-50%</Text></View>
              <Text style={styles.priceLabel}>12 MESES</Text>
              <Text style={styles.price}>4,99 €</Text>
              <Text style={styles.priceSub}>/mes · 59,88€/año</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity testID="premium-cta" activeOpacity={0.85} onPress={() => Alert.alert('Próximamente', 'Las suscripciones estarán disponibles muy pronto vía App Store.')}>
            <LinearGradient colors={['#F5EBD6', '#E8D9B8', '#C9B68C']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.cta}>
              <Text style={styles.ctaText}>Activar Premium</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.legal}>Próximamente. Suscripciones gestionadas por Apple App Store. Cancela cuando quieras.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 380 },
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 4, paddingBottom: 32 },
  logoCircle: { width: 110, height: 110, borderRadius: 999, backgroundColor: 'rgba(232,217,184,0.08)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(232,217,184,0.3)', marginBottom: 20, overflow: 'hidden' },
  logoImg: { width: 100, height: 100 },
  title: { color: theme.textPrimary, fontSize: 42, lineHeight: 46, fontWeight: '300', letterSpacing: -1.5, textAlign: 'center' },
  subtitle: { color: theme.textSecondary, fontSize: 15, marginTop: 12, textAlign: 'center' },
  list: { paddingHorizontal: 16, gap: 10 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surface1, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { color: theme.textPrimary, fontSize: 14, fontWeight: '600' },
  featureDesc: { color: theme.textSecondary, fontSize: 12.5, marginTop: 3, lineHeight: 17 },
  pricing: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 28 },
  priceCard: { flex: 1, backgroundColor: theme.surface1, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.border, position: 'relative' },
  priceCardHot: { borderColor: theme.cream, backgroundColor: theme.surface2 },
  badge: { position: 'absolute', top: -10, backgroundColor: theme.cream, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeText: { color: theme.warmText, fontSize: 8.5, fontWeight: '800', letterSpacing: 0.8 },
  priceLabel: { color: theme.textSecondary, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  price: { color: theme.textPrimary, fontSize: 22, fontWeight: '300', marginTop: 8 },
  priceSub: { color: theme.textSecondary, fontSize: 10, marginTop: 4, textAlign: 'center' },
  cta: { marginHorizontal: 16, marginTop: 24, paddingVertical: 18, borderRadius: 24, alignItems: 'center', shadowColor: theme.cream, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20 },
  ctaText: { color: theme.warmText, fontSize: 16, fontWeight: '700' },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', paddingHorizontal: 32, marginTop: 16, lineHeight: 16 },
});
