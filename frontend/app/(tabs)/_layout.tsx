import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/api';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface1,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 10,
          paddingBottom: 22,
        },
        tabBarActiveTintColor: theme.warm,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
        tabBarIcon: ({ color, size }) => {
          const map: any = { grid: 'grid', tap: 'flash', chats: 'chatbubble', profile: 'person' };
          return <Ionicons name={map[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="grid" options={{ title: 'Descubrir' }} />
      <Tabs.Screen name="tap" options={{ title: 'TAP' }} />
      <Tabs.Screen name="chats" options={{ title: 'Mensajes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Yo' }} />
    </Tabs>
  );
}
