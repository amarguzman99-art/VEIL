# 🍎 VEIL — App Store Submission Checklist

## ✅ App Store Connect — Configuración

| Campo | Valor |
|---|---|
| **Nombre en tienda (App Name)** | `Veil - Citas y encuentros` |
| **Subtítulo (≤30 chars)** | `Más allá de las apariencias` |
| **Nombre bajo el icono (CFBundleDisplayName)** | `Veil` |
| **Bundle ID iOS** | `com.veildating.social` |
| **SKU** | `VEIL-DATING-001` |
| **Idioma principal** | Español (España) |
| **Categoría primaria** | Citas (Dating) |
| **Categoría secundaria** | Redes Sociales |
| **Edad** | 17+ (App Store) / 18+ (lógica de la app, obligatoria) |
| **Precio** | Gratis (con compras dentro: Privé / Élite) |
| **Encriptación no exenta** | `false` |

## 📝 Nota para el Revisor (App Review Notes)

```
The app "Veil" provides a unique dating experience focused on
progressive disclosure ("revealing" the connection beyond appearances).
It is distinct from other apps with similar names in different
categories (Lifestyle), as Veil serves the Dating niche exclusively.

DEMO ACCOUNT (with full Premium / "VEIL Privé" tier unlocked):
  Email:    review@veil.app
  Password: AppReview2026!

The account is pre-seeded with sample matches, taps, conversations
and an empty payment state so the reviewer can explore every feature
without manual setup.

Test scenarios covered:
- Mandatory 18+ age check at registration
- Orientation selection (any/any pairing)
- Photo upload (6 slots), interests (12 from 75+), prompts
- Tap (like) system + mutual matches
- Real-time chat with icebreakers, gifts, and reveal filter
- Premium upgrade flow (Essential / Privé / Élite)
- User reporting + blocking flows
- Self-service account deletion (Profile → Eliminar mi cuenta)
- Profanity word filter on messages (try sending forbidden words)
- Rate limit (30 msg/min)
- Centro de Seguridad / Normas de Comunidad / Privacidad / Términos
```

## ✅ Apple Dating Apps Guidelines Compliance

| Guideline | Status | Implementation |
|---|---|---|
| **1.1.6** No false UI elements | ✅ | All buttons functional |
| **1.2** User-generated content moderation | ✅ | Word filter + report + block + rate-limit |
| **1.6** Safety | ✅ | Safety Center, community guidelines |
| **2.1** Working app | ✅ | All flows tested |
| **3.1.1** In-app purchase use only | ⚠️ | Premium UI ready — needs StoreKit before submission |
| **3.1.2** Subscriptions disclosure | ⚠️ | Auto-renewable text required in Privé/Élite paywall |
| **4.3** Spam | ✅ | Original concept (progressive disclosure / masks) |
| **5.1.1(i)** Age gate | ✅ | Hard 18+ check at registration + tap-through 18+ confirmation |
| **5.1.1(v)** Account deletion | ✅ | `DELETE /api/auth/account` self-service |
| **5.1.2** Data minimization | ✅ | Email + password + DOB + name only required |
| **5.6** Reportable content | ✅ | Report button on every profile |
| **5.6.1** EULA / Terms | ✅ | Linked from Welcome + registration acceptance required |

## 📱 Permisos declarados

**iOS (`Info.plist`)** — todos con descripción clara <10 palabras:
- `NSCameraUsageDescription` → "Toma fotos para tu perfil"
- `NSPhotoLibraryUsageDescription` → "Elige fotos para tu perfil"
- `NSLocationWhenInUseUsageDescription` → "Encuentra personas cerca de ti"
- `ITSAppUsesNonExemptEncryption` → `false`

**Android (`AndroidManifest.xml`)** — declarados en `app.json`:
- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`
- `CAMERA`
- `READ_EXTERNAL_STORAGE`

## 🎨 Assets requeridos

| Asset | Tamaño | Estado |
|---|---|---|
| App Icon iOS | 1024×1024 px (sin transparencia, sin esquinas redondeadas) | ✅ `icon.png` |
| Adaptive Icon Android | 1024×1024 px (foreground + bg color) | ✅ `adaptive-icon.png` |
| Splash | 240px contain en `#0A2620` | ✅ `splash-icon.png` |
| Screenshots iPhone 6.7" | 1290×2796 (min 3) | ⏳ Pendiente generar desde el simulador |
| Screenshots iPhone 6.5" | 1242×2688 (min 3) | ⏳ |
| Screenshots iPad 13" | 2064×2752 (min 3) | ⏳ |
| App Preview (vídeo, opcional) | 1080×1920 ≤ 30s | ⏳ |

## 🚀 Cómo construir y subir a Expo / App Store

```bash
cd /app/frontend

# 1. Login a tu cuenta Expo (una vez)
npx expo login

# 2. Configura credenciales iOS automáticamente
eas credentials --platform ios

# 3. Build de producción (firma con tu Apple Developer)
eas build --platform ios --profile production

# 4. Submit a App Store Connect
eas submit --platform ios --profile production

# Para Android:
eas build --platform android --profile production
eas submit --platform android --profile production
```

> Antes de ejecutar `eas submit`, edita `eas.json` y reemplaza:
> - `appleId` → tu Apple ID
> - `ascAppId` → ID de la app en App Store Connect (lo crea Apple al registrar la app)
> - `appleTeamId` → Apple Team ID

## 📋 Lista final antes de pulsar "Submit for Review"

- [ ] Versión `1.0.0` (build 1) en `app.json` ✅
- [ ] Bundle ID `com.veildating.social` ✅
- [ ] App Name `Veil - Citas y encuentros` ✅
- [ ] Cuenta demo activa: `review@veil.app / AppReview2026!` ✅
- [ ] Screenshots subidos (mín 3 por tamaño) ⏳
- [ ] Descripción + keywords + URL de soporte + URL de privacidad ⏳
- [ ] StoreKit / RevenueCat configurado para Privé/Élite ⏳
- [ ] Nota al revisor pegada (ver arriba) ⏳
- [ ] Categoría: Dating + Social Networking ⏳
- [ ] Rating: 17+ ⏳

---

**📞 Soporte para revisión**: [tu-email]  
**🌐 Política de Privacidad**: https://veil.app/legal/privacy (también dentro de la app)  
**📄 Términos**: https://veil.app/legal/terms (también dentro de la app)
