import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../src/api';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const TIERS = [
  {
    id: 'essential',
    name: 'Essential',
    tagline: 'Detrás del velo',
    price: '9,99 €',
    period: '/mes',
    color: '#9CC2A8',
    features: [
      'Ver quién te ha dado TAP 🔥',
      'Flechas azules (lectura)',
      'TAPs ilimitados',
      'Filtros avanzados',
      'Sin anuncios',
    ],
  },
  {
    id: 'prive',
    name: 'Privé',
    tagline: 'Tu velo controlado',
    price: '19,99 €',
    period: '/mes',
    color: theme.cream,
    popular: true,
    features: [
      'Todo lo de Essential',
      '🌫️ Reveal Filters · foto borrosa hasta el match',
      '👁️ Modo Incógnito · invisible salvo a quien elijas',
      '⚡ Boost diario gratis (30min)',
      '🎁 3 regalos virtuales/mes',
      '🧭 Expandir distancia ilimitada',
    ],
  },
  {
    id: 'elite',
    name: 'Élite',
    tagline: 'El círculo privado',
    price: '49,99 €',
    period: '/mes',
    color: '#F0E0BC',
    features: [
      'Todo lo de Privé',
      '✓ Verificación VIP · badge dorado de élite',
      '👑 Tu nombre destacado en dorado',
      '🛎️ Soporte prioritario 24/7',
      '🥂 Acceso a eventos VEIL exclusivos',
      '∞ Regalos virtuales ilimitados',
    ],
  },
];

const CONSUMIBLES = [
  { icon: 'flash', emoji: '⚡', name: 'Boost x3', desc: '30 min al top, 3 usos', price: '4,99 €', color: '#FBBF24' },
  { icon: null, emoji: '🎭', name: 'Máscara Dorada', desc: 'Regalo visual animado', price: '2,99 €', color: theme.cream },
  { icon: null, emoji: '🌹', name: 'Rosa de Cristal', desc: 'Detalle con mensaje', price: '1,99 €', color: '#F472B6' },
  { icon: null, emoji: '🥂', name: 'Brindis', desc: 'Rompe el hielo elegante', price: '0,99 €', color: '#A78BFA' },
  { icon: 'chatbubble', emoji: '💬', name: 'Chat Token x5', desc: 'Abre conversaciones VIP', price: '3,99 €', color: '#7DD3C0' },
];

export default function Premium() {
  const router = useRouter();
  const [tab, setTab] = useState<'tiers' | 'gifts'>('tiers');

  const showPurchase = () => Alert.alert('Próximamente', 'Las suscripciones y regalos estarán disponibles muy pronto vía Apple App Store.');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#143A30', '#0F2E27', theme.bg]} locations={[0, 0.45, 1]} style={styles.gradientTop} />

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.navRow}>
          <TouchableOpacity testID="premium-close-btn" onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.hero}>
            <View style={styles.logoCircle}>
              <Image source={require('../assets/images/logo-mark.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Club VEIL</Text>
            <Text style={styles.subtitle}>Descubre lo que hay detrás del velo.</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === 'tiers' && styles.tabActive]} onPress={() => setTab('tiers')}>
              <Text style={[styles.tabText, tab === 'tiers' && styles.tabTextActive]}>Membresías</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'gifts' && styles.tabActive]} onPress={() => setTab('gifts')}>
              <Text style={[styles.tabText, tab === 'gifts' && styles.tabTextActive]}>Regalos & Boosts</Text>
            </TouchableOpacity>
          </View>

          {tab === 'tiers' ? (
            <View style={styles.tiersList}>
              {TIERS.map(t => (
                <View key={t.id} style={[styles.tierCard, t.popular && styles.tierCardPopular]}>
                  {t.popular && (
                    <View style={styles.popularBadge}>
                      <Ionicons name="star" size={10} color={theme.warmText} />
                      <Text style={styles.popularText}>MÁS ELEGIDO</Text>
                    </View>
                  )}
                  <View style={styles.tierHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tierName, { color: t.color }]}>{t.name}</Text>
                      <Text style={styles.tierTagline}>{t.tagline}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.tierPrice}>{t.price}</Text>
                      <Text style={styles.tierPeriod}>{t.period}</Text>
                    </View>
                  </View>
                  <View style={styles.featList}>
                    {t.features.map((f, i) => (
                      <View key={i} style={styles.featRow}>
                        <Ionicons name="checkmark" size={14} color={t.color} />
                        <Text style={styles.featText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity testID={`buy-tier-${t.id}`} activeOpacity={0.85} onPress={showPurchase}>
                    <LinearGradient
                      colors={t.popular ? ['#F0E0BC', '#D4B886', '#A88B4E'] : ['rgba(212,184,134,0.15)', 'rgba(212,184,134,0.08)']}
                      start={{x:0,y:0}} end={{x:1,y:1}}
                      style={[styles.tierBtn, !t.popular && styles.tierBtnGhost]}
                    >
                      <Text style={[styles.tierBtnText, !t.popular && { color: theme.cream }]}>
                        {t.popular ? 'Activar Privé' : `Elegir ${t.name}`}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))}
              <Text style={styles.legal}>
                Renovación automática. Cancela cuando quieras desde tu cuenta App Store.
                Pagos gestionados por Apple In-App Purchase.
              </Text>
            </View>
          ) : (
            <View style={styles.giftsList}>
              <Text style={styles.giftsHeader}>Detalles a la carta</Text>
              <Text style={styles.giftsSub}>Sin suscripción. Compra solo lo que quieras enviar.</Text>
              {CONSUMIBLES.map((c, i) => (
                <TouchableOpacity key={i} style={styles.giftCard} onPress={showPurchase} activeOpacity={0.85}>
                  <View style={[styles.giftIcon, { backgroundColor: `${c.color}22` }]}>
                    <Text style={{ fontSize: 28 }}>{c.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.giftName}>{c.name}</Text>
                    <Text style={styles.giftDesc}>{c.desc}</Text>
                  </View>
                  <View style={styles.giftPriceBtn}>
                    <Text style={styles.giftPriceText}>{c.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={styles.revealBox}>
                <Text style={styles.revealLabel}>🌫️ NUEVO · REVEAL FILTERS</Text>
                <Text style={styles.revealTitle}>Tu velo, tus reglas</Text>
                <Text style={styles.revealDesc}>
                  Que tu foto se vea con humo dorado hasta intercambiar 3 mensajes, o
                  hasta que tú decidas revelarte. Incluido en Privé y superiores.
                </Text>
              </View>
              <Text style={styles.legal}>
                Pagos únicos. No se renuevan. Gestionados por Apple In-App Purchase.
              </Text>
            </View>
          )}
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
  hero: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 4, paddingBottom: 24 },
  logoCircle: { width: 100, height: 100, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,184,134,0.4)', backgroundColor: 'rgba(212,184,134,0.05)', marginBottom: 18 },
  logoImg: { width: 80, height: 80 },
  title: { color: theme.textPrimary, fontSize: 38, fontFamily: SERIF, fontWeight: '400', letterSpacing: -1, textAlign: 'center' },
  subtitle: { color: theme.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center', fontStyle: 'italic' },
  tabs: { flexDirection: 'row', backgroundColor: theme.surface1, borderRadius: 999, padding: 4, marginHorizontal: 24, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  tabActive: { backgroundColor: theme.cream },
  tabText: { color: theme.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: theme.warmText, fontWeight: '700' },
  tiersList: { paddingHorizontal: 16, gap: 14 },
  tierCard: { backgroundColor: theme.surface1, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: theme.border, position: 'relative' },
  tierCardPopular: { borderColor: theme.cream, backgroundColor: theme.surface2 },
  popularBadge: { position: 'absolute', top: -10, left: 18, backgroundColor: theme.cream, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 4 },
  popularText: { color: theme.warmText, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  tierHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  tierName: { fontSize: 22, fontFamily: SERIF, fontWeight: '500' },
  tierTagline: { color: theme.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  tierPrice: { color: theme.textPrimary, fontSize: 22, fontWeight: '300' },
  tierPeriod: { color: theme.textSecondary, fontSize: 11 },
  featList: { gap: 6, marginBottom: 14 },
  featRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  featText: { color: theme.textPrimary, fontSize: 13, flex: 1, lineHeight: 18 },
  tierBtn: { borderRadius: 999, paddingVertical: 13, alignItems: 'center' },
  tierBtnGhost: { borderWidth: 1, borderColor: 'rgba(212,184,134,0.4)' },
  tierBtnText: { color: theme.warmText, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  giftsList: { paddingHorizontal: 16, gap: 10 },
  giftsHeader: { color: theme.textPrimary, fontSize: 20, fontFamily: SERIF, marginTop: 4 },
  giftsSub: { color: theme.textSecondary, fontSize: 13, fontStyle: 'italic', marginBottom: 10 },
  giftCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: theme.surface1, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  giftIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  giftName: { color: theme.textPrimary, fontSize: 15, fontWeight: '600' },
  giftDesc: { color: theme.textSecondary, fontSize: 12, marginTop: 2 },
  giftPriceBtn: { backgroundColor: 'rgba(212,184,134,0.15)', borderColor: 'rgba(212,184,134,0.4)', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  giftPriceText: { color: theme.cream, fontSize: 13, fontWeight: '700' },
  revealBox: { marginTop: 16, padding: 18, backgroundColor: theme.surface2, borderRadius: 16, borderWidth: 1, borderColor: theme.border, borderLeftWidth: 3, borderLeftColor: theme.cream },
  revealLabel: { color: theme.cream, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  revealTitle: { color: theme.textPrimary, fontSize: 20, fontFamily: SERIF, marginTop: 6 },
  revealDesc: { color: theme.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  legal: { color: theme.textMuted, fontSize: 10.5, textAlign: 'center', paddingHorizontal: 16, marginTop: 16, lineHeight: 16 },
});
