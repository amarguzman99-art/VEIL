import React, { useState, useRef, useEffect } from 'react';
import {
View, Text, StyleSheet, TouchableOpacity, ScrollView,
SafeAreaView, StatusBar, TextInput, Image, FlatList,
Switch, Modal, Alert, Dimensions, Animated, Easing
} from 'react-native';

const { width, height } = Dimensions.get('window');

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
bg: '#060e08',
bgMid: '#0a1a0d',
bgLight: '#0f2414',
card: '#0d1a0f',
cardBorder: '#1a2e1c',
gold: '#c9a84c',
goldLight: '#e8c96a',
goldDark: '#8a6a1a',
goldGlow: 'rgba(201,168,76,0.15)',
green: '#1a3a1a',
greenDark: '#0d1f0d',
white: '#f5f5f0',
gray: '#7a8a7a',
grayDark: '#2a3a2a',
red: '#c0392b',
online: '#2ecc71',
};

// ─── LOGO URL ────────────────────────────────────────────────────────────────
const LOGO_URL = 'https://lindy.nyc3.digitaloceanspaces.com/user-content/prod/owners/6a06340da93ca137bca0e2da/attachments/d21485f7-56dc-41be-88b3-7493114152fb-IMG_4071.PNG?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DO00QNZAZRRRMG9PUNE4%2F20260514%2Fnyc3%2Fs3%2Faws4_request&X-Amz-Date=20260514T211255Z&X-Amz-Expires=86400&X-Amz-Signature=8006c4a350fe2f652e8dd0a1fc92f175e4ba922ec76cc7c6157cb701233c0072&X-Amz-SignedHeaders=host&x-id=GetObject';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_PROFILES = [
{ id: '1', name: 'Sara', age: 25, distance: '200m', online: true, live: true },
{ id: '2', name: 'Diego', age: 28, distance: '300m', online: true, live: false },
{ id: '3', name: 'Lucía', age: 23, distance: '500m', online: false, live: false },
{ id: '4', name: 'Marcos', age: 30, distance: '1km', online: true, live: true },
{ id: '5', name: 'Elena', age: 27, distance: '1.2km', online: true, live: false },
{ id: '6', name: 'Andrés', age: 24, distance: '2km', online: false, live: false },
];

const MOCK_CHATS = [
{ id: '1', name: 'Sara', lastMsg: 'Hola! ¿Cómo estás?', time: '17:31', unread: 2 },
{ id: '2', name: 'Diego', lastMsg: '🎤 Mensaje de voz', time: '13:47', unread: 0 },
{ id: '3', name: 'Grupo Veil', lastMsg: 'Lucía: ¡Buenas noches!', time: '12:09', unread: 5, isGroup: true },
];

const COUNTRIES = ['Todo el mundo', 'España', 'México', 'Argentina', 'Colombia', 'Estados Unidos', 'Francia', 'Italia'];
const GENDERS = ['Todos', 'Hombres', 'Mujeres'];

// ─── SMOKE PARTICLE ──────────────────────────────────────────────────────────
const SmokeParticle = ({ delay, startX, size, duration }) => {
const opacity = useRef(new Animated.Value(0)).current;
const translateY = useRef(new Animated.Value(0)).current;
const translateX = useRef(new Animated.Value(0)).current;
const scale = useRef(new Animated.Value(0.3)).current;

useEffect(() => {
  const animate = () => {
    opacity.setValue(0);
    translateY.setValue(0);
    translateX.setValue(0);
    scale.setValue(0.3);
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0.18, duration: duration * 0.3, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
        Animated.timing(scale, { toValue: 1.4, duration: duration, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
        Animated.timing(translateY, { toValue: -height * 0.65, duration: duration, useNativeDriver: true, easing: Easing.linear }),
        Animated.timing(translateX, { toValue: (Math.random() > 0.5 ? 1 : -1) * 60, duration: duration, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: duration * 0.3, useNativeDriver: true }),
    ]).start(() => animate());
  };
  animate();
}, []);

return (
  <Animated.View
    style={{
      position: 'absolute',
      bottom: -size / 2,
      left: startX,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: 'rgba(15,36,20,1)',
      opacity,
      transform: [{ translateY }, { translateX }, { scale }],
    }}
  />
);
};

// ─── SMOKE BACKGROUND ────────────────────────────────────────────────────────
const SmokeBackground = ({ children, style }) => {
const particles = [
  { id: 1, delay: 0,    startX: width * 0.05, size: 130, duration: 6500 },
  { id: 2, delay: 900,  startX: width * 0.25, size: 190, duration: 7800 },
  { id: 3, delay: 1800, startX: width * 0.45, size: 160, duration: 7000 },
  { id: 4, delay: 2700, startX: width * 0.65, size: 210, duration: 8200 },
  { id: 5, delay: 3600, startX: width * 0.82, size: 140, duration: 7300 },
  { id: 6, delay: 450,  startX: width * 0.15, size: 170, duration: 7500 },
  { id: 7, delay: 1350, startX: width * 0.55, size: 150, duration: 6800 },
  { id: 8, delay: 2250, startX: width * 0.35, size: 200, duration: 8800 },
];
return (
  <View style={[{ flex: 1, backgroundColor: C.bg, overflow: 'hidden' }, style]}>
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg }} />
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55, backgroundColor: C.bgMid, opacity: 0.45 }} />
    <View style={{ position: 'absolute', top: height * 0.2, left: width * 0.15, right: width * 0.15, height: height * 0.35, borderRadius: 200, backgroundColor: 'rgba(201,168,76,0.03)' }} />
    {particles.map(p => <SmokeParticle key={p.id} {...p} />)}
    {children}
  </View>
);
};

// ─── VEIL LOGO ────────────────────────────────────────────────────────────────
const VeilLogo = ({ size = 40, animated: isAnimated = false }) => {
const pulse = useRef(new Animated.Value(1)).current;
const glow = useRef(new Animated.Value(0)).current;

useEffect(() => {
  if (!isAnimated) return;
  Animated.loop(
    Animated.sequence([
      Animated.parallel([
        Animated.timing(pulse, { toValue: 1.06, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(glow, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse, { toValue: 1, duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(glow, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    ])
  ).start();
}, []);

const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] });

return (
  <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
    {isAnimated && (
      <Animated.View style={{
        position: 'absolute',
        width: size * 1.5,
        height: size * 1.5,
        borderRadius: size * 0.75,
        backgroundColor: 'rgba(201,168,76,0.12)',
        opacity: glowOpacity,
      }} />
    )}
    <Animated.Image
      source={{ uri: LOGO_URL }}
      style={{ width: size, height: size, resizeMode: 'contain', transform: isAnimated ? [{ scale: pulse }] : [] }}
    />
  </View>
);
};

// ─── GOLD BUTTON ─────────────────────────────────────────────────────────────
const GoldButton = ({ title, onPress, style, textStyle, outline }) => (
<TouchableOpacity
  onPress={onPress}
  style={[{
    backgroundColor: outline ? 'transparent' : C.gold,
    borderWidth: outline ? 1.5 : 0,
    borderColor: C.gold,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  }, style]}
>
  <Text style={[{ color: outline ? C.gold : C.bg, fontWeight: '700', fontSize: 15 }, textStyle]}>{title}</Text>
</TouchableOpacity>
);

// ─── PROFILE AVATAR ──────────────────────────────────────────────────────────
const ProfileAvatar = ({ name, size = 50, online, live }) => (
<View style={{ position: 'relative' }}>
  <View style={{
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: C.green,
    borderWidth: 2, borderColor: live ? C.gold : online ? C.online : C.grayDark,
    alignItems: 'center', justifyContent: 'center',
  }}>
    <Text style={{ color: C.gold, fontSize: size * 0.4, fontWeight: 'bold' }}>
      {name ? name[0].toUpperCase() : '?'}
    </Text>
  </View>
  {live && (
    <View style={{ position: 'absolute', bottom: -2, right: -2, backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 }}>
      <Text style={{ color: C.bg, fontSize: 8, fontWeight: 'bold' }}>LIVE</Text>
    </View>
  )}
  {!live && online && (
    <View style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: C.online, borderWidth: 2, borderColor: C.bg }} />
  )}
</View>
);

// ─── WELCOME SCREEN ──────────────────────────────────────────────────────────
const WelcomeScreen = ({ onLogin, onRegister, onGuest }) => {
const fadeIn = useRef(new Animated.Value(0)).current;
const slideUp = useRef(new Animated.Value(40)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeIn, { toValue: 1, duration: 1200, delay: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
    Animated.timing(slideUp, { toValue: 0, duration: 1000, delay: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
  ]).start();
}, []);

return (
  <SmokeBackground style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Animated.View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        <VeilLogo size={110} animated />
        <Text style={styles.appTitle}>VEIL</Text>
        <Text style={styles.appSubtitle}>Conexión Real. Discreción Absoluta.</Text>
        <View style={{ width: '100%', marginTop: 52, gap: 12 }}>
          <GoldButton title="Crear Velo" onPress={onRegister} />
          <GoldButton title="Tengo un Velo" onPress={onLogin} outline />
          <TouchableOpacity onPress={onGuest} style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ color: C.gray, fontSize: 13 }}>Iniciar como Invitado</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <View style={{ paddingBottom: 24, alignItems: 'center' }}>
        <Text style={{ color: C.grayDark, fontSize: 11 }}>Al continuar aceptas nuestros Términos y Política de Privacidad</Text>
      </View>
    </SafeAreaView>
  </SmokeBackground>
);
};

// ─── AGE VERIFICATION ────────────────────────────────────────────────────────
const AgeVerificationScreen = ({ onVerified, onBack }) => {
const [step, setStep] = useState(1);
return (
  <SmokeBackground>
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Atrás</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
        <VeilLogo size={60} animated />
        <Text style={[styles.screenTitle, { marginTop: 16 }]}>Verificación +18</Text>
        <Text style={styles.screenSubtitle}>Veil es una plataforma exclusiva para adultos. Necesitamos verificar tu edad.</Text>
        {step === 1 && (
          <View style={{ width: '100%', marginTop: 32 }}>
            <View style={styles.verifyCard}>
              <Text style={styles.verifyIcon}>🪪</Text>
              <Text style={styles.verifyTitle}>Paso 1: ID Oficial</Text>
              <Text style={styles.verifyDesc}>Sube una foto de tu DNI, pasaporte o documento oficial que muestre tu fecha de nacimiento.</Text>
              <GoldButton title="Subir Documento" onPress={() => setStep(2)} style={{ marginTop: 16 }} />
            </View>
          </View>
        )}
        {step === 2 && (
          <View style={{ width: '100%', marginTop: 32 }}>
            <View style={styles.verifyCard}>
              <Text style={styles.verifyIcon}>🤳</Text>
              <Text style={styles.verifyTitle}>Paso 2: Face ID</Text>
              <Text style={styles.verifyDesc}>Confirma que eres tú con una selfie en tiempo real. Tus datos son procesados de forma segura y no se almacenan.</Text>
              <GoldButton title="Verificar con Face ID" onPress={onVerified} style={{ marginTop: 16 }} />
            </View>
            <View style={[styles.verifyCard, { marginTop: 12, backgroundColor: C.greenDark }]}>
              <Text style={{ color: C.gray, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
                🔒 Tus datos biométricos son eliminados inmediatamente tras la verificación. Cumplimos con GDPR y CCPA.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  </SmokeBackground>
);
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
const RegisterScreen = ({ onComplete, onBack }) => {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
return (
  <SmokeBackground>
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Atrás</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ alignItems: 'center' }}>
          <VeilLogo size={60} animated />
        </View>
        <Text style={[styles.screenTitle, { marginTop: 16 }]}>Crear tu Velo</Text>
        <Text style={styles.screenSubtitle}>Completa tu perfil único en minutos</Text>
        <View style={{ marginTop: 32, gap: 14 }}>
          <View>
            <Text style={styles.inputLabel}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor={C.grayDark} />
          </View>
          <View>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="tu@email.com" placeholderTextColor={C.grayDark} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" placeholderTextColor={C.grayDark} secureTextEntry />
          </View>
          <View>
            <Text style={styles.inputLabel}>Ubicación</Text>
            <TextInput style={styles.input} placeholder="Ciudad, País" placeholderTextColor={C.grayDark} />
          </View>
          <GoldButton title="Continuar a Verificación" onPress={onComplete} style={{ marginTop: 8 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  </SmokeBackground>
);
};

// ─── HOME ────────────────────────────────────────────────────────────────────
const HomeScreen = ({ onVideoCall, onChat, userName }) => {
const [activeFilter, setActiveFilter] = useState('Todos');
const filters = ['Todos', 'Online', 'Live', 'Cercanos'];
return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
    <View style={styles.homeHeader}>
      <View>
        <Text style={styles.homeGreeting}>Hola, {userName || 'Guzman'} 👋</Text>
        <Text style={styles.homeSubGreeting}>Parrilla de perfiles cercanos</Text>
      </View>
      <VeilLogo size={38} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
      {filters.map(f => (
        <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}>
          <Text style={[styles.filterChipText, activeFilter === f && styles.filterChipTextActive]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    <FlatList
      data={MOCK_PROFILES}
      numColumns={2}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View style={styles.profileCard}>
          <ProfileAvatar name={item.name} size={60} online={item.online} live={item.live} />
          <Text style={styles.profileName}>{item.name}, {item.age}</Text>
          <Text style={styles.profileDistance}>📍 {item.distance}</Text>
          <View style={styles.profileActions}>
            <TouchableOpacity onPress={() => onChat(item)} style={styles.profileActionBtn}>
              <Text style={styles.profileActionText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onVideoCall} style={[styles.profileActionBtn, styles.profileActionBtnGold]}>
              <Text style={styles.profileActionText}>📹</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  </View>
);
};

// ─── VELO (VIDEO ROULETTE) ───────────────────────────────────────────────────
const VeloScreen = () => {
const [active, setActive] = useState(false);
const [country, setCountry] = useState('Todo el mundo');
const [gender, setGender] = useState('Todos');
const [camera, setCamera] = useState('Delantera');
const [showCountryPicker, setShowCountryPicker] = useState(false);
const [showGenderPicker, setShowGenderPicker] = useState(false);
const [currentUser, setCurrentUser] = useState({ name: 'Sara', age: 25 });

const handleNext = () => {
  const names = ['Diego', 'Lucía', 'Marcos', 'Elena', 'Andrés', 'Carmen', 'Pablo'];
  const ages = [22, 24, 25, 26, 27, 28, 30];
  setCurrentUser({ name: names[Math.floor(Math.random() * names.length)], age: ages[Math.floor(Math.random() * ages.length)] });
};

const handleReport = () => {
  Alert.alert('Reportar usuario', '¿Por qué quieres reportar a este usuario?', [
    { text: 'Contenido inapropiado', onPress: () => Alert.alert('Reporte enviado', 'Gracias. Revisaremos en 24h.') },
    { text: 'Acoso', onPress: () => Alert.alert('Reporte enviado', 'Gracias. Revisaremos en 24h.') },
    { text: 'Identidad falsa', onPress: () => Alert.alert('Reporte enviado', 'Gracias. Revisaremos en 24h.') },
    { text: 'Cancelar', style: 'cancel' },
  ]);
};

if (!active) {
  return (
    <SmokeBackground style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <VeilLogo size={70} animated />
        </View>
        <Text style={styles.screenTitle}>El Velo</Text>
        <Text style={styles.screenSubtitle}>Videollamada aleatoria. Descubrimiento libre a pantalla completa.</Text>
        <View style={{ marginTop: 32, gap: 16 }}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🌍 País</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(true)} style={styles.settingValue}>
              <Text style={styles.settingValueText}>{country} ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>👤 Sexo</Text>
            <TouchableOpacity onPress={() => setShowGenderPicker(true)} style={styles.settingValue}>
              <Text style={styles.settingValueText}>{gender} ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>📷 Cámara</Text>
            <TouchableOpacity onPress={() => setCamera(camera === 'Delantera' ? 'Trasera' : 'Delantera')} style={styles.settingValue}>
              <Text style={styles.settingValueText}>{camera} ⇄</Text>
            </TouchableOpacity>
          </View>
        </View>
        <GoldButton title="Iniciar El Velo" onPress={() => setActive(true)} style={{ marginTop: 40 }} />
      </View>
      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Seleccionar País</Text>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c} onPress={() => { setCountry(c); setShowCountryPicker(false); }} style={styles.modalOption}>
                <Text style={[styles.modalOptionText, country === c && { color: C.gold }]}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowCountryPicker(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: C.gray, textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showGenderPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Seleccionar Sexo</Text>
            {GENDERS.map(g => (
              <TouchableOpacity key={g} onPress={() => { setGender(g); setShowGenderPicker(false); }} style={styles.modalOption}>
                <Text style={[styles.modalOptionText, gender === g && { color: C.gold }]}>{g}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowGenderPicker(false)} style={{ marginTop: 8 }}>
              <Text style={{ color: C.gray, textAlign: 'center' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SmokeBackground>
  );
}

return (
  <View style={{ flex: 1, backgroundColor: '#000' }}>
    <View style={{ flex: 1, backgroundColor: '#0a1a0d', alignItems: 'center', justifyContent: 'center' }}>
      <ProfileAvatar name={currentUser.name} size={120} online={true} />
      <Text style={{ color: C.white, fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>{currentUser.name}, {currentUser.age}</Text>
      <Text style={{ color: C.gray, fontSize: 14, marginTop: 4 }}>{country} · {gender}</Text>
    </View>
    <View style={{ backgroundColor: C.bg, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={() => setCamera(camera === 'Delantera' ? 'Trasera' : 'Delantera')} style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>🔄</Text>
          <Text style={styles.controlBtnLabel}>Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
          <VeilLogo size={28} />
          <Text style={styles.nextBtnText}>Siguiente</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReport} style={styles.controlBtn}>
          <Text style={styles.controlBtnText}>🚩</Text>
          <Text style={styles.controlBtnLabel}>Reportar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => setActive(false)} style={styles.endCallBtn}>
        <Text style={{ color: C.white, fontWeight: '700' }}>Terminar</Text>
      </TouchableOpacity>
    </View>
  </View>
);
};

// ─── CHATS ───────────────────────────────────────────────────────────────────
const ChatsScreen = ({ onOpenChat }) => {
const [search, setSearch] = useState('');
const filtered = MOCK_CHATS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
    <View style={styles.homeHeader}>
      <Text style={styles.screenTitle}>Mensajes</Text>
      <TouchableOpacity style={styles.newGroupBtn}>
        <Text style={{ color: C.gold, fontSize: 13 }}>+ Grupo</Text>
      </TouchableOpacity>
    </View>
    <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
      <TextInput style={styles.searchInput} placeholder="Buscar..." placeholderTextColor={C.grayDark} value={search} onChangeText={setSearch} />
    </View>
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onOpenChat(item)} style={styles.chatRow}>
          <ProfileAvatar name={item.name} size={48} online={true} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.chatTime}>{item.time}</Text>
            </View>
            <Text style={styles.chatLastMsg} numberOfLines={1}>{item.lastMsg}</Text>
          </View>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  </View>
);
};

// ─── CHAT DETAIL ─────────────────────────────────────────────────────────────
const ChatDetailScreen = ({ chat, onBack }) => {
const [message, setMessage] = useState('');
const [messages, setMessages] = useState([
  { id: '1', text: '¡Hola! ¿Cómo estás?', mine: false, time: '17:31', type: 'text' },
  { id: '2', text: 'Muy bien, ¿y tú?', mine: true, time: '17:32', type: 'text' },
  { id: '3', text: '🎤 Mensaje de voz · 0:12', mine: false, time: '17:33', type: 'voice' },
  { id: '4', text: '📷 Foto efímera', mine: true, time: '17:34', type: 'photo' },
]);
const [showOptions, setShowOptions] = useState(false);

const sendMessage = () => {
  if (!message.trim()) return;
  setMessages(prev => [...prev, { id: Date.now().toString(), text: message, mine: true, time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }), type: 'text' }]);
  setMessage('');
};

return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={onBack}><Text style={{ color: C.gold, fontSize: 16 }}>←</Text></TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ProfileAvatar name={chat?.name || 'U'} size={36} online={true} />
        <Text style={styles.chatHeaderName}>{chat?.name || 'Chat'}</Text>
      </View>
      <TouchableOpacity onPress={() => setShowOptions(true)}><Text style={{ color: C.gold, fontSize: 20 }}>⋯</Text></TouchableOpacity>
    </View>
    <FlatList
      data={messages}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16, gap: 8 }}
      renderItem={({ item }) => (
        <View style={[styles.msgBubble, item.mine ? styles.msgMine : styles.msgTheirs]}>
          <Text style={[styles.msgText, item.type === 'voice' && { color: C.gold }]}>{item.text}</Text>
          <Text style={styles.msgTime}>{item.time}</Text>
        </View>
      )}
    />
    <View style={styles.chatInputRow}>
      <TouchableOpacity style={styles.chatIconBtn}><Text>🎤</Text></TouchableOpacity>
      <TextInput style={styles.chatInput} value={message} onChangeText={setMessage} placeholder="Mensaje..." placeholderTextColor={C.grayDark} />
      <TouchableOpacity style={styles.chatIconBtn}><Text>📷</Text></TouchableOpacity>
      <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}><Text style={{ color: C.bg, fontWeight: 'bold' }}>→</Text></TouchableOpacity>
    </View>
    <Modal visible={showOptions} transparent animationType="fade">
      <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowOptions(false)}>
        <View style={[styles.modalSheet, { position: 'absolute', top: 80, right: 16, width: 180 }]}>
          <TouchableOpacity style={styles.modalOption} onPress={() => { Alert.alert('Chat eliminado'); setShowOptions(false); }}>
            <Text style={styles.modalOptionText}>🗑 Eliminar Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => setShowOptions(false)}>
            <Text style={styles.modalOptionText}>👥 Crear Grupo</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  </View>
);
};

// ─── PRESTIGE ────────────────────────────────────────────────────────────────
const PrestigeScreen = () => {
const plans = [
  { id: '1', name: 'Veil Prestige', period: '1 mes', price: '9,99€', popular: false },
  { id: '2', name: 'Veil Prestige', period: '6 meses', price: '49,99€', popular: true },
  { id: '3', name: 'Veil Prestige', period: '12 meses', price: '89,99€', popular: false },
];
const features = [
  { icon: '⬆️', title: 'Sube tu Velo', desc: 'Perfil destacado en tu zona' },
  { icon: '✅', title: 'Radar de Lectura', desc: 'Confirmación de lectura dorada' },
  { icon: '♾️', title: 'Velo Infinito', desc: 'Fotos efímeras ilimitadas' },
  { icon: '🌍', title: 'Filtros Avanzados', desc: 'Elige países específicos ilimitadamente' },
];
return (
  <SmokeBackground>
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <VeilLogo size={60} animated />
        <Text style={[styles.screenTitle, { marginTop: 12 }]}>Veil Prestige</Text>
        <Text style={styles.screenSubtitle}>Desbloquea la experiencia completa</Text>
      </View>
      {features.map(f => (
        <View key={f.title} style={styles.featureRow}>
          <Text style={{ fontSize: 24 }}>{f.icon}</Text>
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}
      <View style={{ marginTop: 24, gap: 12 }}>
        {plans.map(p => (
          <TouchableOpacity key={p.id} style={[styles.planCard, p.popular && styles.planCardPopular]}>
            {p.popular && (
              <View style={styles.popularBadge}>
                <Text style={{ color: C.bg, fontSize: 10, fontWeight: 'bold' }}>MÁS POPULAR</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planPeriod}>{p.period}</Text>
              </View>
              <Text style={styles.planPrice}>{p.price}</Text>
            </View>
            <GoldButton title="Suscribirme a Prestige" onPress={() => {}} style={{ marginTop: 12 }} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  </SmokeBackground>
);
};

// ─── PRIVACY SETTINGS ────────────────────────────────────────────────────────
const PrivacyScreen = ({ onBack }) => {
const [settings, setSettings] = useState({ verEstado: true, verEstado2: false, añadirGrupos: true, añadirAvanzados: false, verEstado3: true, verEstado4: false });
const toggle = key => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
const items = [
  { key: 'verEstado', label: 'Ver mi Estado' },
  { key: 'verEstado2', label: 'Ver mi Estado (grupos)' },
  { key: 'añadirGrupos', label: 'Añadir a Grupos' },
  { key: 'añadirAvanzados', label: 'Añadir a Avanzados' },
  { key: 'verEstado3', label: 'Ver mi Estado (contactos)' },
  { key: 'verEstado4', label: 'Ver mi Estado (todos)' },
];
return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={onBack}><Text style={{ color: C.gold, fontSize: 16 }}>←</Text></TouchableOpacity>
      <Text style={styles.chatHeaderName}>Ajustes de Privacidad</Text>
      <View style={{ width: 24 }} />
    </View>
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {items.map(item => (
        <View key={item.key} style={styles.privacyRow}>
          <Text style={styles.privacyLabel}>{item.label}</Text>
          <Switch value={settings[item.key]} onValueChange={() => toggle(item.key)} trackColor={{ false: C.grayDark, true: C.goldDark }} thumbColor={settings[item.key] ? C.gold : C.gray} />
        </View>
      ))}
    </ScrollView>
  </View>
);
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
const [screen, setScreen] = useState('welcome');
const [activeTab, setActiveTab] = useState('home');
const [selectedChat, setSelectedChat] = useState(null);
const [userName] = useState('Guzman');

const renderMain = () => {
  switch (activeTab) {
    case 'home': return <HomeScreen onVideoCall={() => setActiveTab('velo')} onChat={(u) => { setSelectedChat(u); setScreen('chatDetail'); }} userName={userName} />;
    case 'velo': return <VeloScreen />;
    case 'chats': return <ChatsScreen onOpenChat={(c) => { setSelectedChat(c); setScreen('chatDetail'); }} />;
    case 'prestige': return <PrestigeScreen />;
    default: return null;
  }
};

if (screen === 'welcome') return <WelcomeScreen onLogin={() => setScreen('main')} onRegister={() => setScreen('register')} onGuest={() => setScreen('main')} />;
if (screen === 'register') return <RegisterScreen onComplete={() => setScreen('ageVerify')} onBack={() => setScreen('welcome')} />;
if (screen === 'ageVerify') return <AgeVerificationScreen onVerified={() => setScreen('main')} onBack={() => setScreen('register')} />;
if (screen === 'chatDetail') return <ChatDetailScreen chat={selectedChat} onBack={() => setScreen('main')} />;
if (screen === 'privacy') return <PrivacyScreen onBack={() => setScreen('main')} />;

return (
  <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
    <StatusBar barStyle="light-content" backgroundColor={C.bg} />
    <View style={{ flex: 1 }}>{renderMain()}</View>
    <View style={styles.bottomNav}>
      {[
        { key: 'home', icon: '🏠', label: 'Home' },
        { key: 'velo', icon: '🎭', label: 'El Velo' },
        { key: 'chats', icon: '💬', label: 'Mensajes' },
        { key: 'prestige', icon: '⭐', label: 'Prestige' },
      ].map(tab => (
        <TouchableOpacity key={tab.key} onPress={() => { setActiveTab(tab.key); setScreen('main'); }} style={styles.navTab}>
          <Text style={[styles.navIcon, activeTab === tab.key && styles.navIconActive]}>{tab.icon}</Text>
          <Text style={[styles.navLabel, activeTab === tab.key && styles.navLabelActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </SafeAreaView>
);
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
appTitle: { color: '#c9a84c', fontSize: 44, fontWeight: '900', letterSpacing: 10, marginTop: 20 },
appSubtitle: { color: '#7a8a7a', fontSize: 15, marginTop: 10, textAlign: 'center' },
screenTitle: { color: '#c9a84c', fontSize: 26, fontWeight: '800', textAlign: 'center' },
screenSubtitle: { color: '#7a8a7a', fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
backBtn: { padding: 16 },
backBtnText: { color: '#c9a84c', fontSize: 15 },
inputLabel: { color: '#7a8a7a', fontSize: 12, marginBottom: 6, marginLeft: 4 },
input: { backgroundColor: '#0d1a0f', borderWidth: 1, borderColor: '#1a2e1c', borderRadius: 10, padding: 14, color: '#f5f5f0', fontSize: 15 },
searchInput: { backgroundColor: '#0d1a0f', borderWidth: 1, borderColor: '#1a2e1c', borderRadius: 10, padding: 12, color: '#f5f5f0', fontSize: 14 },
homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
homeGreeting: { color: '#f5f5f0', fontSize: 20, fontWeight: '700' },
homeSubGreeting: { color: '#7a8a7a', fontSize: 12, marginTop: 2 },
filterRow: { paddingHorizontal: 12, marginBottom: 8 },
filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#0d1a0f', marginRight: 8, borderWidth: 1, borderColor: '#1a2e1c' },
filterChipActive: { backgroundColor: '#c9a84c', borderColor: '#c9a84c' },
filterChipText: { color: '#7a8a7a', fontSize: 13 },
filterChipTextActive: { color: '#060e08', fontWeight: '700' },
profileCard: { flex: 1, margin: 6, backgroundColor: '#0d1a0f', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1a2e1c' },
profileName: { color: '#f5f5f0', fontSize: 14, fontWeight: '600', marginTop: 8 },
profileDistance: { color: '#7a8a7a', fontSize: 11, marginTop: 2 },
profileActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
profileActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a2e1c', alignItems: 'center', justifyContent: 'center' },
profileActionBtnGold: { backgroundColor: '#c9a84c' },
profileActionText: { fontSize: 16 },
settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0d1a0f', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1a2e1c' },
settingLabel: { color: '#f5f5f0', fontSize: 15 },
settingValue: {},
settingValueText: { color: '#c9a84c', fontSize: 15 },
controlBtn: { alignItems: 'center', gap: 4 },
controlBtnText: { fontSize: 24 },
controlBtnLabel: { color: '#7a8a7a', fontSize: 11 },
nextBtn: { alignItems: 'center', backgroundColor: '#c9a84c', borderRadius: 50, paddingHorizontal: 32, paddingVertical: 14, gap: 4 },
nextBtnText: { color: '#060e08', fontWeight: '800', fontSize: 16 },
endCallBtn: { backgroundColor: '#c0392b', borderRadius: 12, padding: 14, alignItems: 'center' },
chatRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a2e1c' },
chatName: { color: '#f5f5f0', fontSize: 15, fontWeight: '600' },
chatTime: { color: '#7a8a7a', fontSize: 12 },
chatLastMsg: { color: '#7a8a7a', fontSize: 13, marginTop: 2 },
unreadBadge: { backgroundColor: '#c9a84c', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
unreadText: { color: '#060e08', fontSize: 11, fontWeight: 'bold' },
newGroupBtn: { padding: 8 },
chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1a2e1c' },
chatHeaderName: { color: '#f5f5f0', fontSize: 16, fontWeight: '700' },
msgBubble: { maxWidth: '75%', borderRadius: 14, padding: 12 },
msgMine: { alignSelf: 'flex-end', backgroundColor: '#1a3a1a', borderBottomRightRadius: 4 },
msgTheirs: { alignSelf: 'flex-start', backgroundColor: '#0d1a0f', borderBottomLeftRadius: 4 },
msgText: { color: '#f5f5f0', fontSize: 14 },
msgTime: { color: '#7a8a7a', fontSize: 10, marginTop: 4, textAlign: 'right' },
chatInputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#1a2e1c', gap: 8 },
chatInput: { flex: 1, backgroundColor: '#0d1a0f', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#f5f5f0', fontSize: 14 },
chatIconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#c9a84c', alignItems: 'center', justifyContent: 'center' },
featureRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1a0f', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1a2e1c' },
featureTitle: { color: '#f5f5f0', fontSize: 15, fontWeight: '600' },
featureDesc: { color: '#7a8a7a', fontSize: 12, marginTop: 2 },
planCard: { backgroundColor: '#0d1a0f', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1a2e1c', position: 'relative' },
planCardPopular: { borderColor: '#c9a84c', borderWidth: 2 },
popularBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: '#c9a84c', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
planName: { color: '#f5f5f0', fontSize: 15, fontWeight: '700' },
planPeriod: { color: '#7a8a7a', fontSize: 13, marginTop: 2 },
planPrice: { color: '#c9a84c', fontSize: 22, fontWeight: '900' },
privacyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a2e1c' },
privacyLabel: { color: '#f5f5f0', fontSize: 15 },
verifyCard: { backgroundColor: '#0d1a0f', borderRadius: 14, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1a2e1c' },
verifyIcon: { fontSize: 40, marginBottom: 12 },
verifyTitle: { color: '#c9a84c', fontSize: 18, fontWeight: '700', marginBottom: 8 },
verifyDesc: { color: '#7a8a7a', fontSize: 13, textAlign: 'center', lineHeight: 20 },
modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
modalSheet: { backgroundColor: '#0d1a0f', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
modalTitle: { color: '#c9a84c', fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a2e1c' },
modalOptionText: { color: '#f5f5f0', fontSize: 15 },
bottomNav: { flexDirection: 'row', backgroundColor: '#060e08', borderTopWidth: 1, borderTopColor: '#1a2e1c', paddingBottom: 8 },
navTab: { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
navIcon: { fontSize: 22, opacity: 0.4 },
navIconActive: { opacity: 1 },
navLabel: { color: '#2a3a2a', fontSize: 10, marginTop: 3 },
navLabelActive: { color: '#c9a84c', fontWeight: '600' },
});
