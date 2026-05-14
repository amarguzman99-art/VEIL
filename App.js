import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar, Dimensions, ScrollView, TextInput, FlatList } from 'react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [matches, setMatches] = useState([
    { id: 1, alias: 'CosmicWhisper', messages: 5, revealed: false },
    { id: 2, alias: 'MysticEcho', messages: 15, revealed: false },
    { id: 3, alias: 'SilentDream', messages: 45, revealed: true },
  ]);
  const [isPremium, setIsPremium] = useState(false);
  const [rouletteActive, setRouletteActive] = useState(false);
  const [rouletteUser, setRouletteUser] = useState(null);

  const renderHome = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.logo}>🎭</Text>
        <Text style={styles.title}>VEIL</Text>
        <Text style={styles.subtitle}>La máscara te la quitas cuando quieres</Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>✨ Características Principales</Text>
          <Text style={styles.featureItem}>🎲 Veil Roulette - Videollamadas Aleatorias</Text>
          <Text style={styles.featureItem}>🎭 Veil Mode - Conocerse a Ciegas</Text>
          <Text style={styles.featureItem}>🎵 Mensajes de Voz</Text>
          <Text style={styles.featureItem}>📸 Fotos Efímeras</Text>
          <Text style={styles.featureItem}>👥 Grupos Privados</Text>
        </View>

        <TouchableOpacity 
          style={styles.buttonPrimary}
          onPress={() => setCurrentScreen('roulette')}
        >
          <Text style={styles.buttonTextPrimary}>🎲 VEIL ROULETTE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => setCurrentScreen('matches')}
        >
          <Text style={styles.buttonTextSecondary}>💬 EXPLORAR MATCHES</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.buttonSecondary}
          onPress={() => setCurrentScreen('premium')}
        >
          <Text style={styles.buttonTextSecondary}>👑 PREMIUM</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderRoulette = () => {
    if (!rouletteActive) {
      return (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.logo}>🎲</Text>
            <Text style={styles.title}>VEIL ROULETTE</Text>
            <Text style={styles.subtitle}>Videollamadas Aleatorias Anónimas</Text>
            
            <View style={styles.rouletteInfo}>
              <Text style={styles.infoText}>✓ Comienza con máscara digital</Text>
              <Text style={styles.infoText}>✓ Quita la máscara si ambos lo desean</Text>
              <Text style={styles.infoText}>✓ Siguiente usuario al instante</Text>
              <Text style={styles.infoText}>✓ Totalmente anónimo y seguro</Text>
            </View>

            <TouchableOpacity 
              style={styles.buttonPrimary}
              onPress={() => {
                setRouletteActive(true);
                setRouletteUser({ alias: generateAlias(), masked: true });
              }}
            >
              <Text style={styles.buttonTextPrimary}>INICIAR ROULETTE</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        <View style={styles.rouletteContainer}>
          <Text style={styles.rouletteTitle}>VIDEOLLAMADA EN VIVO</Text>
          
          {rouletteUser?.masked ? (
            <View style={styles.maskOverlay}>
              <Text style={styles.maskText}>🎭</Text>
              <Text style={styles.maskLabel}>MÁSCARA ACTIVA</Text>
              <Text style={styles.aliasText}>{rouletteUser.alias}</Text>
            </View>
          ) : (
            <View style={styles.revealedOverlay}>
              <Text style={styles.revealedText}>😊</Text>
              <Text style={styles.revealedLabel}>IDENTIDAD REVELADA</Text>
              <Text style={styles.nameText}>Nombre: Usuario</Text>
            </View>
          )}

          <View style={styles.rouletteButtons}>
            <TouchableOpacity 
              style={styles.rouletteButton}
              onPress={() => setRouletteUser({ ...rouletteUser, masked: !rouletteUser.masked })}
            >
              <Text style={styles.rouletteButtonText}>
                {rouletteUser?.masked ? '🎭 Quitar Máscara' : '🎭 Ocultar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.rouletteButton}
              onPress={() => setRouletteUser({ alias: generateAlias(), masked: true })}
            >
              <Text style={styles.rouletteButtonText}>⏭️ Siguiente</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.rouletteButton, styles.endButton]}
              onPress={() => setRouletteActive(false)}
            >
              <Text style={styles.rouletteButtonText}>❌ Terminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderMatches = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>VEIL MODE</Text>
        <Text style={styles.subtitle}>Conocerse a Ciegas</Text>
        
        <FlatList
          scrollEnabled={false}
          data={matches}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.matchCard}>
              <Text style={styles.matchAlias}>{item.alias}</Text>
              <Text style={styles.matchInfo}>Mensajes: {item.messages}</Text>
              
              {item.messages >= 20 && !item.revealed && (
                <Text style={styles.revealInfo}>📝 Nombre desbloqueado</Text>
              )}
              {item.messages >= 50 && !item.revealed && (
                <Text style={styles.revealInfo}>📸 Foto desbloqueada</Text>
              )}
              {item.revealed && (
                <Text style={styles.revealedStatus}>✓ Identidad Revelada</Text>
              )}

              <TouchableOpacity style={styles.chatButton}>
                <Text style={styles.chatButtonText}>💬 CHATEAR</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );

  const renderPremium = () => (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>👑 PREMIUM</Text>
        <Text style={styles.subtitle}>Desbloquea todas las características</Text>
        
        <View style={styles.premiumFeatures}>
          <View style={styles.premiumItem}>
            <Text style={styles.premiumIcon}>⭐</Text>
            <Text style={styles.premiumText}>Perfil Destacado</Text>
            <Text style={styles.premiumDesc}>Aparece primero en tu zona</Text>
          </View>

          <View style={styles.premiumItem}>
            <Text style={styles.premiumIcon}>✓</Text>
            <Text style={styles.premiumText}>Confirmación de Lectura</Text>
            <Text style={styles.premiumDesc}>Saber si leyeron tu mensaje</Text>
          </View>

          <View style={styles.premiumItem}>
            <Text style={styles.premiumIcon}>📸</Text>
            <Text style={styles.premiumText}>Fotos Ilimitadas</Text>
            <Text style={styles.premiumDesc}>Envía todas las que quieras</Text>
          </View>

          <View style={styles.premiumItem}>
            <Text style={styles.premiumIcon}>👥</Text>
            <Text style={styles.premiumText}>Crear Grupos</Text>
            <Text style={styles.premiumDesc}>Chats grupales sin límite</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.premiumButton}>
          <Text style={styles.premiumButtonText}>SUSCRIBIRSE - $9.99/mes</Text>
        </TouchableOpacity>

        <Text style={styles.freeText}>10 fotos efímeras gratis al mes</Text>
      </View>
    </ScrollView>
  );

  const renderNavigation = () => (
    <View style={styles.navbar}>
      <TouchableOpacity 
        style={[styles.navButton, currentScreen === 'home' && styles.navButtonActive]}
        onPress={() => setCurrentScreen('home')}
      >
        <Text style={styles.navText}>🏠</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, currentScreen === 'roulette' && styles.navButtonActive]}
        onPress={() => setCurrentScreen('roulette')}
      >
        <Text style={styles.navText}>🎲</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, currentScreen === 'matches' && styles.navButtonActive]}
        onPress={() => setCurrentScreen('matches')}
      >
        <Text style={styles.navText}>💬</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navButton, currentScreen === 'premium' && styles.navButtonActive]}
        onPress={() => setCurrentScreen('premium')}
      >
        <Text style={styles.navText}>👑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>VEIL</Text>
      </View>

      {/* Screen Content */}
      {currentScreen === 'home' && renderHome()}
      {currentScreen === 'roulette' && renderRoulette()}
      {currentScreen === 'matches' && renderMatches()}
      {currentScreen === 'premium' && renderPremium()}

      {/* Navigation */}
      {renderNavigation()}
    </SafeAreaView>
  );
}

function generateAlias() {
  const adjectives = ['Cosmic', 'Mystic', 'Silent', 'Velvet', 'Phantom', 'Lunar', 'Shadow', 'Echo'];
  const nouns = ['Whisper', 'Dream', 'Soul', 'Heart', 'Mind', 'Spirit', 'Flame', 'Star'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerLogo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 5,
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  card: {
    margin: 15,
    backgroundColor: '#111',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#b366ff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: '600',
  },
  featureList: {
    width: '100%',
    marginBottom: 25,
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 15,
  },
  featureTitle: {
    color: '#b366ff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureItem: {
    color: '#888',
    fontSize: 12,
    marginVertical: 5,
  },
  buttonPrimary: {
    backgroundColor: '#b366ff',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonSecondary: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b366ff',
  },
  buttonTextSecondary: {
    color: '#b366ff',
    fontWeight: '600',
    fontSize: 13,
  },
  rouletteInfo: {
    width: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  infoText: {
    color: '#888',
    fontSize: 13,
    marginVertical: 5,
  },
  rouletteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rouletteTitle: {
    color: '#b366ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  maskOverlay: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#b366ff',
  },
  maskText: {
    fontSize: 80,
    marginBottom: 10,
  },
  maskLabel: {
    color: '#b366ff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  aliasText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  revealedOverlay: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  revealedText: {
    fontSize: 80,
    marginBottom: 10,
  },
  revealedLabel: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  nameText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  rouletteButtons: {
    width: '100%',
    gap: 10,
  },
  rouletteButton: {
    backgroundColor: '#b366ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 5,
  },
  rouletteButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  endButton: {
    backgroundColor: '#ff4444',
  },
  matchCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#b366ff',
  },
  matchAlias: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  matchInfo: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  revealInfo: {
    color: '#b366ff',
    fontSize: 11,
    marginVertical: 3,
  },
  revealedStatus: {
    color: '#4CAF50',
    fontSize: 11,
    marginVertical: 3,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#b366ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  premiumFeatures: {
    width: '100%',
    marginBottom: 20,
  },
  premiumItem: {
    backgroundColor: '#0a0a0a',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  premiumIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  premiumDesc: {
    color: '#888',
    fontSize: 12,
  },
  premiumButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 15,
  },
  premiumButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  freeText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  navButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#b366ff',
  },
  navText: {
    fontSize: 24,
  },
});
