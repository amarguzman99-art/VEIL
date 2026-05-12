# VEIL — App Review Notes for Apple

## Copy/paste this into "App Review Information → Notes" in App Store Connect

---

Hello App Review Team,

VEIL is a dating and social app for the adult LGBTQ+ community (18+). Below you'll find everything needed to review the app.

### Demo Account
- Email: review@veil.app
- Password: AppReview2026!
- This account is Premium-enabled so you can access all gated features.

### Age Verification
- Mandatory at registration: users must enter age ≥ 18
- Mandatory checkbox confirming they are 18+ and accept Terms + Privacy
- Backend rejects any registration with age < 18

### Safety & Moderation
- **Report user**: profile → "···" → Report → categorized reasons (harassment, fake, explicit content, spam, minor, other)
- **Block user**: profile → "···" → Block (immediate)
- **Content filter**: automated detection of prohibited terms in messages and bios (escort, minor, chemsex, etc.) → blocks and auto-reports
- **Rate limiting**: max 30 messages/min (anti-spam)
- **Human review** of all reports within 24h (safety@veil.app)
- **Delete account**: profile → "Eliminar mi cuenta" → permanent deletion of all user data (Apple Guideline 5.1.1(v))

### Privacy & Location
- Location coordinates rounded to nearest 0.5 km for privacy (no exact GPS shown to other users)
- All sensitive data (orientation, location, messages) stored with bcrypt password hashing and TLS encryption
- Full GDPR compliance: explicit consent, right to delete, right to export
- Sensitive data category (orientation) explicitly disclosed in Privacy Policy

### Legal Documents (in-app, accessible from Profile menu)
- Privacy Policy
- Terms of Service
- Community Guidelines
- Safety Center (with safety tips + LGBTQ+ hotlines)

### Content Standards
- No explicit nudity, pornography, prostitution, escort services, chemsex, or any illegal content
- Branding and language are social/lifestyle, NOT explicit
- All seeded profile photos are PG-rated stock images

### Monetization
- Premium subscriptions UI is implemented but currently shown as "Coming Soon"
- All future paid digital content will use Apple In-App Purchases (no external payment systems)

### Permissions
- Location (When in Use): for nearby people discovery — clearly explained in NSLocationWhenInUseUsageDescription
- Camera/Photo Library: optional, only when user wants to upload profile photos

### Architecture
- Native iOS app built with Expo SDK 54 (React Native)
- Backend: FastAPI + MongoDB on HTTPS

### Support
- support@veil.app · safety@veil.app · privacy@veil.app

Thank you for your time. Please reach out if you need anything else.

— The VEIL Team
