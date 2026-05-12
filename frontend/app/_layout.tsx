import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme, seed } from '../src/api';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Initial bootstrap
  useEffect(() => {
    (async () => {
      try { await seed(); } catch {}
      const t = await AsyncStorage.getItem('veil_token');
      setAuthed(!!t);
      setLoading(false);
    })();
  }, []);

  // Re-check auth state every time route changes (handles login/register/logout)
  useEffect(() => {
    if (loading) return;
    (async () => {
      const t = await AsyncStorage.getItem('veil_token');
      const isAuthed = !!t;
      setAuthed(isAuthed);
      const inAuth = segments[0] === '(auth)';
      if (!isAuthed && !inAuth) router.replace('/(auth)/welcome');
      else if (isAuthed && inAuth) router.replace('/(tabs)/grid');
    })();
  }, [segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.warm} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg }, animation: 'fade' }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
