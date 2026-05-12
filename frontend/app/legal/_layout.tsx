import { Stack } from 'expo-router';
import { theme } from '../../src/api';

export default function LegalLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.bg },
        headerTintColor: theme.textPrimary,
        headerTitleStyle: { color: theme.textPrimary, fontWeight: '300', letterSpacing: 0.5 },
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="privacy" options={{ title: 'Política de Privacidad' }} />
      <Stack.Screen name="terms" options={{ title: 'Términos de Servicio' }} />
      <Stack.Screen name="community" options={{ title: 'Normas de Comunidad' }} />
      <Stack.Screen name="safety" options={{ title: 'Centro de Seguridad' }} />
    </Stack>
  );
}
