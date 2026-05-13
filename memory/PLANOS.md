# 📐 VEIL — Planos de la Aplicación

Documento de arquitectura, diseño y publicación.

---

## 1. App Store Connect — Configuración

| Campo | Valor |
|---|---|
| **Nombre en tienda (App Name)** | `Veil - Citas y encuentros` |
| **Nombre bajo el icono (Bundle Display Name)** | `Veil` |
| **Bundle ID (iOS)** | `com.veildating.social` |
| **Package (Android)** | `com.veildating.social` |
| **Slug Expo** | `veil-citas` |
| **Versión** | `1.0.0` (build 1) |
| **Categoría primaria** | Citas (Dating) |
| **Categoría secundaria** | Redes Sociales (Social Networking) |
| **Edad mínima** | 17+ (App Store) / 18+ (lógica de app, obligatoria) |
| **Idioma principal** | Español (es-ES) |
| **Encriptación no exenta** | `false` (`ITSAppUsesNonExemptEncryption`) |

### Nota para el Revisor (App Review Notes)
```
The app "Veil" provides a unique dating experience focused on
progressive disclosure ("revealing" the connection beyond appearances).
It is distinct from other apps with similar names in different categories
(Lifestyle), as Veil serves the Dating niche exclusively.

Demo account (full Premium / "VEIL Privé" tier):
  Email:    review@veil.app
  Password: AppReview2026!

The account is pre-seeded with sample matches, taps and conversations
so the reviewer can explore every feature without manual setup.
```

### Permisos declarados (Info.plist)
| Clave | Texto |
|---|---|
| `NSCameraUsageDescription` | "Toma fotos para tu perfil" |
| `NSPhotoLibraryUsageDescription` | "Elige fotos para tu perfil" |
| `NSLocationWhenInUseUsageDescription` | "Encuentra personas cerca de ti" |

### Permisos Android
`ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `CAMERA`, `READ_EXTERNAL_STORAGE`

---

## 2. Identidad Visual

| Elemento | Valor |
|---|---|
| Paleta primaria | Esmeralda profundo `#0A2620` → `#061814` |
| Paleta de superficies | `#0F2E27`, `#143A30`, `#1A4A3D` |
| Acento dorado | Crema `#E8D9B8`, Oro `#D4B886`, Glow `#F0E0BC` |
| Tipografía display | Georgia / Serif (titulares) |
| Tipografía UI | System (San Francisco / Roboto) |
| Iconografía | Ionicons |
| Animaciones | react-native-reanimated v3 |

### Iconos clave
- Splash: `splash-icon.png`
- App icon (iOS): `icon.png`
- Adaptive icon (Android): `adaptive-icon.png` sobre `#0A2620`
- Favicon web: `favicon.png`
- Hero del Welcome: `welcome-hero.jpg` (1080×1080, máscara dorada sobre verde esmeralda con humo)

---

## 3. Mapa de Pantallas

```
┌──────────────────────────────────────────────┐
│              (auth) — Sin login              │
├──────────────────────────────────────────────┤
│  welcome      → Hero VEIL + 2 CTAs           │
│  orientation  → ¿Cómo te identificas?        │
│  register     → Crear cuenta                 │
│  login        → Bienvenido de vuelta         │
└──────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│              onboarding (one-shot)            │
└──────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────┐
│              (tabs) — App principal           │
├──────────────────────────────────────────────┤
│  grid         → Descubrir + Sugerencias      │
│  tap          → Taps recibidos               │
│  chats        → Conversaciones               │
│  profile      → Mi perfil + Preferencias     │
└──────────────────────────────────────────────┘
        │              │
        ↓              ↓
   user/[id]      chat/[id]
   (perfil)      (mensajes,
                  velo + regalos)
        │              │
        ↓              ↓
     match          premium
     (visto y         (3 planos:
      visto)          Essential /
                      Privé / Élite)

┌──────────────────────────────────────────────┐
│  legal/                                       │
│    privacy   terms   safety   community       │
└──────────────────────────────────────────────┘
```

---

## 4. Flujo de Onboarding

```
Welcome ──→ Orientation ──→ Register ──→ Onboarding tour ──→ Grid
                │
                └── 4 opciones primarias + 2 secundarias:
                    · Chico busca chica / chico
                    · Chica busca chico / chica
                    · Chico/Chica busca todo (en Preferencias)
```

---

## 5. Modelo de Datos (MongoDB)

### `users`
```ts
{
  id: uuid,
  email: string (unique),
  password_hash: bcrypt,
  name: string,
  age: number (>= 18),
  bio: string (<= 300),
  photo: string | null,           // base64 o URL principal
  photos: string[] (<= 6),
  interests: string[] (<= 12),
  prompts: [{ q, a }] (<= 3),
  verified: boolean,
  gender: "man" | "woman",
  looking_for: "man" | "woman" | "both",
  latitude: number, longitude: number,
  is_premium: boolean,
  blocked: uuid[],
  boost_until: iso_date | null,
  last_active: iso_date,
  onboarded: boolean,
  created_at: iso_date
}
```

### `messages`
```ts
{
  id: uuid,
  conversation_id: string (sorted_uid1_uid2),
  from_user_id: uuid, to_user_id: uuid,
  text: string,
  kind: "text" | "gift",
  gift_type?: "golden_mask" | "crystal_rose" | "silk_veil" | "emerald_heart" | "diamond",
  read: boolean,
  created_at: iso_date
}
```

### `taps`
```ts
{ id, from_user_id, to_user_id, tap_type: wave|flame|drink|heart|kiss|eye, created_at }
```

### `reveals` (Filtros de Revelación)
```ts
{ id, conversation_id, revealed_by: uuid, created_at }
```

### `reports`
```ts
{ id, from_user_id, target_user_id, reason, context, created_at }
```

---

## 6. API Reference (FastAPI)

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Crear cuenta (gender + looking_for) | – |
| POST | `/api/auth/login` | Iniciar sesión | – |
| GET  | `/api/auth/me` | Mi perfil | ✅ |
| DELETE | `/api/auth/account` | Eliminar cuenta | ✅ |
| PUT  | `/api/profile` | Actualizar (incluye gender/looking_for) | ✅ |
| GET  | `/api/users/nearby` | Descubrir (filtra por orientación) | ✅ |
| GET  | `/api/users/daily-picks` | 3 picks curados | ✅ |
| GET  | `/api/users/{id}` | Ver perfil | ✅ |
| POST | `/api/boost/activate` | Activar boost 1h | ✅ |
| POST | `/api/messages` | Enviar mensaje (texto) | ✅ |
| GET  | `/api/messages/{user_id}` | Conversación | ✅ |
| GET  | `/api/conversations` | Lista de chats | ✅ |
| **POST** | **`/api/gifts/send`** | **Enviar regalo (Élite)** | ✅ |
| **GET**  | **`/api/reveal/{user_id}`** | **Estado de revelación** | ✅ |
| **POST** | **`/api/reveal/{user_id}`** | **Revelar al instante (Privé)** | ✅ |
| POST | `/api/taps` | Enviar TAP | ✅ |
| GET  | `/api/matches` | Mis matches | ✅ |
| POST | `/api/block` | Bloquear | ✅ |
| POST | `/api/report` | Reportar | ✅ |
| POST | `/api/seed` | Sembrar demos (idempotente) | – |

---

## 7. Funcionalidades Premium ("Club VEIL")

| Plan | Funcionalidades | Precio sugerido (referencia) |
|---|---|---|
| **Essential** (free) | Grid, taps básicos, chat con texto, 3 regalos gratis/24h | – |
| **Privé** | + Filtros de Revelación (revelar al instante), boost, ver quién te ha dado tap | 9,99 €/mes |
| **Élite** | + Todos los regalos premium (Diamante, Corazón Esmeralda), perfil destacado | 19,99 €/mes |

### Filtros de Revelación (Privé)
- La foto del otro usuario se muestra **borrosa + máscara dorada animada** durante los primeros 3 mensajes de cada lado.
- Cuando ambos han enviado ≥3 mensajes → revelación automática (mutua).
- Premium (Privé/Élite) puede **revelar al instante** desde el chat.

### Regalos Virtuales
| Regalo | Emoji | Tier |
|---|---|---|
| Máscara Dorada | 🎭 | Free |
| Rosa de Cristal | 🌹 | Free |
| Velo de Seda | 🕊️ | Free |
| Corazón Esmeralda | 💚 | Élite |
| Diamante | 💎 | Élite |

---

## 8. Cumplimiento Apple (Dating Apps)

- ✅ 18+ obligatorio (validación en registro + Term & Conditions)
- ✅ Cuenta demo (review@veil.app / AppReview2026!) idempotente con datos pre-sembrados
- ✅ Sistema de reporte de usuarios (`POST /api/report`)
- ✅ Sistema de bloqueo (`POST /api/block`)
- ✅ Filtro de palabras prohibidas en mensajes (`contains_prohibited`)
- ✅ Rate limit anti-spam (30 msg/min)
- ✅ Eliminar cuenta auto-servicio (`DELETE /api/auth/account`)
- ✅ Centro de Seguridad + Normas de Comunidad + Privacidad + Términos
- ✅ `ITSAppUsesNonExemptEncryption: false`

---

## 9. Stack Técnico

| Capa | Tecnología |
|---|---|
| Frontend | Expo SDK + Expo Router (file-based) |
| UI | React Native + StyleSheet + Reanimated v3 |
| Backend | FastAPI (Python 3.x) + Motor (async MongoDB) |
| DB | MongoDB |
| Auth | JWT (PyJWT) + bcrypt |
| Storage de imágenes | Base64 in-DB (MVP); migrable a S3 |
| Tunelado dev | Expo Tunnel (LAN/web) |

---

## 10. Próximos Pasos (Backlog)

- 🔔 Notificaciones push (expo-notifications) cuando llegue un tap, mensaje o regalo
- 🌍 Filtro por distancia con slider (1–100 km)
- 🎤 Mensajes de voz (snippets ≤ 60 s)
- 📹 Verificación de identidad por video-selfie (anti-fake)
- 🤖 Sugerencias de prompts y rompehielos generados por IA
- 💳 Integración real de StoreKit/Google Billing (planes Privé / Élite)

---

_Última actualización: 13 de mayo de 2026_
