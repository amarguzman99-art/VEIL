import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme, getStoredUser } from '../src/api';

const { width } = Dimensions.get('window');

export default function MatchScreen() {
  const { name, photo, userId } = useLocalSearchParams<{ name: string; photo: string; userId: string }>();
  const router = useRouter();
  const scale = useSharedValue(0);
  const myScale = useSharedValue(0);
  const sparkle = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSpring(1, { damping: 8 });
    myScale.value = withSpring(1, { damping: 8 });
    sparkle.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, []);

  const theirStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { rotate: '-6deg' }] }));
  const myStyle = useAnimatedStyle(() => ({ transform: [{ scale: myScale.value }, { rotate: '6deg' }] }));
  const sparkStyle = useAnimatedStyle(() => ({ opacity: 0.5 + sparkle.value * 0.5, transform: [{ scale: 1 + sparkle.value * 0.15 }] }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#3B1273', '#080412']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.bigHalo, sparkStyle]} />
      <View style={[styles.blob, { top: 100, left: -80, backgroundColor: '#F5B642', opacity: 0.25 }]} />
      <View style={[styles.blob, { bottom: 150, right: -100, backgroundColor: '#A78BFA', opacity: 0.4 }]} />

      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }} edges={['top','bottom']}>
        <View style={{ alignItems: 'center', paddingTop: 32 }}>
          <Text style={styles.titleSmall}>VEIL</Text>
          <Text style={styles.headline}>¡Conexión!</Text>
          <Text style={styles.subtitle}>Tú y {name} os habéis dado TAP mutuamente.</Text>
        </View>

        <View style={styles.photosRow}>
          <Animated.View style={[styles.photoCard, theirStyle]}>
            {photo ? <Image source={{ uri: photo }} style={styles.photoImg} /> : <View style={[styles.photoImg, styles.placeholder]}><Ionicons name="person" size={50} color={theme.textSecondary} /></View>}
            <View style={styles.flameBadge}><Text style={{ fontSize: 22 }}>🔥</Text></View>
          </Animated.View>
          <Animated.View style={[styles.photoCard, myStyle, { marginLeft: -30 }]}>
            <View style={[styles.photoImg, styles.placeholder]}>
              <Ionicons name="person" size={50} color={theme.textSecondary} />
            </View>
            <View style={[styles.flameBadge, { backgroundColor: theme.cream }]}><Text style={{ fontSize: 22 }}>💜</Text></View>
          </Animated.View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.tip}>Sed los primeros en decir hola 👋</Text>
          <TouchableOpacity testID="match-chat-btn" activeOpacity={0.85} onPress={() => router.replace(`/chat/${userId}`)}>
            <LinearGradient colors={['#F5EBD6', '#E8D9B8', '#C9B68C']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Empezar chat</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity testID="match-back-btn" style={styles.btnGhost} onPress={() => router.back()}>
            <Text style={styles.btnGhostText}>Seguir descubriendo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  blob: { position: 'absolute', width: 280, height: 280, borderRadius: 999 },
  bigHalo: { position: 'absolute', top: '30%', left: '50%', marginLeft: -200, width: 400, height: 400, borderRadius: 999, backgroundColor: '#7C3AED' },
  titleSmall: { color: theme.cream, fontSize: 14, letterSpacing: 6, fontWeight: '600' },
  headline: { color: theme.textPrimary, fontSize: 56, fontWeight: '300', letterSpacing: -2, fontStyle: 'italic', marginTop: 12 },
  subtitle: { color: theme.textPrimary, fontSize: 16, opacity: 0.85, marginTop: 8, textAlign: 'center', paddingHorizontal: 32 },
  photosRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  photoCard: { width: width * 0.4, height: width * 0.55, borderRadius: 20, overflow: 'visible' },
  photoImg: { width: '100%', height: '100%', borderRadius: 20, borderWidth: 3, borderColor: theme.cream },
  placeholder: { backgroundColor: theme.surface2, alignItems: 'center', justifyContent: 'center' },
  flameBadge: { position: 'absolute', bottom: -10, alignSelf: 'center', backgroundColor: theme.surface1, width: 44, height: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.cream },
  bottom: { paddingHorizontal: 24, width: '100%', alignItems: 'center', paddingBottom: 12 },
  tip: { color: theme.textPrimary, fontSize: 14, marginBottom: 16, opacity: 0.7 },
  btnPrimary: { borderRadius: 999, paddingVertical: 18, paddingHorizontal: 56, alignItems: 'center', minWidth: width * 0.7 },
  btnPrimaryText: { color: theme.warmText, fontSize: 16, fontWeight: '700' },
  btnGhost: { marginTop: 12, paddingVertical: 14 },
  btnGhostText: { color: theme.textPrimary, fontSize: 14, opacity: 0.7 },
});
