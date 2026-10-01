# PeakForm

**Dein ganzer Tag. Eine App.**

PeakForm ist eine Fitness-App, die Kalorien, Wasser, Workouts, Schlaf und tägliche Gewohnheiten in einer einzigen App zusammenführt. Beim ersten Start gibt der Nutzer seine Grundwerte ein (Alter, Grösse, Gewicht, Aktivitätslevel, Ziel), und die App schlägt daraus ein persönliches Kalorienziel vor.

📄 **One-Pager (Aufgabe 6.1):** [docs/one-pager.md](./docs/one-pager.md)

## Pitch

Wer ins Gym geht, nutzt heute oft fünf Apps gleichzeitig: eine für Kalorien, eine fürs Training, eine für Wasser, eine für Schlaf und eine für Gewohnheiten. PeakForm ersetzt sie durch ein Dashboard, auf dem man den ganzen Tag auf einen Blick sieht. Die Basisfunktionen sind gratis, Premium (ab CHF 6.90/Monat) bietet Statistiken, Trainingspläne und Rezeptvorschläge.

## Zielgruppe

Fitnessbegeisterte zwischen 16 und 35 Jahren, die regelmässig trainieren oder damit anfangen und Ernährung und Training strukturierter angehen wollen. Sie sind smartphone-affin, wollen Fortschritte sehen und suchen eine motivierende App statt mehrerer Einzeltools.

## Wichtigste Funktionen

- **Persönliches Kalorienziel:** automatisch aus den Grundwerten berechnet, per Stepper anpassbar
- **Kalorien- & Wasser-Tracking:** Mahlzeiten erfassen, Wasser mit einem Tipp (+250 ml)
- **Workout-Log:** Pläne wie Push / Pull / Legs, Sätze mit Gewicht und Wiederholungen, Pausen-Timer
- **Schlaf & Gewohnheiten:** Schlafdauer und tägliche Habits abhaken
- **Dashboard:** alle Tageswerte auf einem Screen

## Tech-Stack (geplant)

| Bereich | Technologie |
| --- | --- |
| App | React Native mit Expo, TypeScript |
| Navigation | React Navigation (Bottom Tabs + Native Stack + Modals) |
| State | Zustand (globaler Store), `useState` für Screen-State |
| Lokale Daten | AsyncStorage, Expo SecureStore (Login-Token) |
| Benachrichtigungen | expo-notifications (Wasser-Erinnerungen) |
| Backend | Supabase (Auth, Postgres, REST-API) |
| Health-Daten | Apple HealthKit / Android Health Connect (später) |

## Runbook: Projekt starten

### Voraussetzungen

- [Node.js](https://nodejs.org) in der LTS-Version (inkl. npm)
- Git
- Die App **Expo Go** auf dem Handy (App Store / Google Play) **oder** ein iOS-Simulator (nur macOS mit Xcode) bzw. ein Android-Emulator (Android Studio)

### Installation

```bash
git clone <REPO-URL>
cd peakform
npm install
```

### Umgebungsvariablen

Kopiere die Vorlage und trage die eigenen Werte ein:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=<deine-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<dein-anon-key>
```

### Starten

```bash
npm start
# entspricht: npx expo start
```

Danach im Terminal:

- **QR-Code** mit Expo Go (Android) bzw. der Kamera-App (iOS) scannen → App öffnet sich auf dem Handy
- `i` drücken → iOS-Simulator
- `a` drücken → Android-Emulator
- `w` drücken → Web-Vorschau im Browser

### Häufige Probleme

| Problem | Lösung |
| --- | --- |
| Handy findet den Server nicht | Handy und Computer müssen im selben WLAN sein, sonst `npx expo start --tunnel` |
| Alte Version oder seltsame Fehler nach Änderungen | Cache leeren: `npx expo start -c` |
| Fehler nach `git pull` | `npm install` erneut ausführen |

## Projektstruktur (geplant)

```
peakform/
├── app/            # Screens und Navigation
├── components/     # Wiederverwendbare UI-Bausteine
├── store/          # Globaler State (Zustand)
├── lib/            # API, Storage, Kalorienberechnung
├── docs/           # One-Pager, Wireframes, Architektur
└── README.md
```