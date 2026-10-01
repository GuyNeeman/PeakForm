# PeakForm – App-Architektur

Sep 30, 2026 · @Guy

PeakForm wird mit React Native (Expo) gebaut: Tabs als Hauptnavigation, ein Stack pro Tab und Modals für Eingaben. Daten werden lokal gespeichert (offline nutzbar) und im Hintergrund mit einer REST-API synchronisiert. Die Nummern 01–08 verweisen auf die Screens im Wireframe.

## Komponenten

Dreizehn Bausteine decken alle acht Screens ab; jeder Screen setzt sich nur aus diesen zusammen.

| Komponente | Zweck | Wichtige Props | Verwendet in |
| --- | --- | --- | --- |
| `ScreenHeader` | Titel, optional Zurück-Button und Aktion rechts | `title`, `onBack?`, `rightAction?` | 02, 03, 06, 07, 08 |
| `GreetingHeader` | Begrüssung mit Avatar | `userName`, `avatarUrl`, `onAvatarPress` | 04 |
| `DashboardCard` | Kachel-Rahmen für alle Dashboard-Inhalte | `title`, `onPress?`, `children` | 04 |
| `ProgressRing` | Kreis-Fortschritt (Kalorien, Tagesziel) | `value`, `goal`, `size`, `label` | 03, 04 |
| `PrimaryButton` | Hauptaktion, volle Breite, 56 pt | `label`, `onPress`, `disabled`, `loading` | 01–03, 05, 07 |
| `IconButton` / `Fab` | Runde Icon-Aktion, z. B. «+» | `icon`, `onPress`, `accessibilityLabel` | 04, 06 |
| `TextField` | Eingabefeld mit Label, Einheit und Fehlermeldung | `label`, `value`, `onChange`, `unit?`, `keyboardType`, `error?` | 02, 05, 07 |
| `SegmentedControl` | Auswahl aus 2–4 Optionen | `options`, `selected`, `onChange` | 02, 05, 06, 08 |
| `PickerSheet` | Auswahl als Bottom Sheet | `options`, `selected`, `onSelect`, `visible` | 02 |
| `ListItem` | Zeile mit Titel, Untertitel und rechtem Element (Pfeil, Switch, «+») | `title`, `subtitle?`, `right`, `onPress?`, `onDelete?` (Swipe) | 05, 06, 08 |
| `SetRow` | Satz-Zeile im Workout: kg, Wiederholungen, Haken | `set`, `onChange`, `onToggleDone` | 07 |
| `HabitToggle` | Runder Habit-Button mit Check-Animation | `icon`, `done`, `onToggle` | 04 |
| `Toast` | Kurze Rückmeldung mit optionalem «Rückgängig» | `message`, `actionLabel?`, `onAction?` | 04, 07 |

Alle Farben, Abstände und Schriftgrössen kommen aus einem gemeinsamen Theme (Light und Dark), nicht aus den Komponenten selbst.

## Navigation

Primäres Schema ist ein kombiniertes Pattern: Bottom Tabs mit fünf Bereichen, darin je ein Stack, dazu Modals über allem. Einen Drawer gibt es nicht, weil fünf Bereiche in die Tab-Leiste passen und dort in der Daumenzone liegen.

&#91;embedded content: Navigationshierarchie · Root-Stack, Onboarding, 5 Tabs, Modals\]

Zusätzlich führen von Home Push-Übergänge direkt zu 07 Workout-Detail; 05 öffnet über «+» auf Home oder im Tab Mahlzeiten. Ein Tipp auf den aktiven Tab setzt dessen Stack auf den ersten Screen zurück.

## Datenmodell

Elf Objekte reichen für das MVP; alle tragen `id`, `createdAt` und `updatedAt` für die Synchronisation. Tageswerte werden über `date` (YYYY-MM-DD) gruppiert, nicht über Zeitstempel.

```ts
UserProfile   { id, name, avatarUrl?, sex, birthDate, heightCm, weightKg,
                activityLevel, goal: 'lose' | 'maintain' | 'gain', isPremium }

DailyGoal     { id, userId, kcal, proteinG, carbsG, fatG, waterMl,
                validFrom, isCustom }          // aus Profil berechnet, per Stepper angepasst

MealEntry     { id, userId, date, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
                foodId?, name, kcal, proteinG?, carbsG?, fatG?, amountG? }

FoodItem      { id, name, kcalPer100g, proteinG, carbsG, fatG, source: 'db' | 'custom' }

WaterEntry    { id, userId, date, amountMl, loggedAt }

WorkoutPlan   { id, userId, name, exercises: [{ exerciseId, targetSets, targetReps }] }

WorkoutSession{ id, userId, planId?, date, startedAt, endedAt?, status: 'active' | 'done',
                sets: [{ id, exerciseId, index, weightKg, reps, done }] }

SleepEntry    { id, userId, date, durationMin, source: 'manual' | 'health' }

Habit         { id, userId, title, icon, order, isActive }
HabitCheck    { id, habitId, date, done }

Settings      { waterReminder: { enabled, intervalMin }, theme: 'system' | 'light' | 'dark',
                unit: 'kg' | 'lb', healthSync, leftHanded }
```

Das Kalorienziel wird nach Mifflin-St-Jeor aus Profilwerten berechnet und mit einem Faktor für Aktivität und Ziel angepasst. `Exercise` (Name, Muskelgruppe) ist eine fixe Liste, die mit der App ausgeliefert wird.

## Zustand & Side-Effekte

Faustregel: Was nur ein Screen braucht, bleibt lokal (`useState`); was mehrere Screens lesen oder was gespeichert wird, liegt in einem globalen Store (Zustand oder React Context).

| State | Ort | Begründung |
| --- | --- | --- |
| Formular-Eingaben und Fehler (02) | Lokal | Erst beim «Weiter» ins Profil übernommen |
| Suchtext, Trefferliste, gewählte Mahlzeit (05) | Lokal | Verfällt beim Schliessen des Sheets |
| Stepper-Wert vor dem Übernehmen (03) | Lokal | Wird erst mit «Ziel übernehmen» gespeichert |
| Pausen-Timer (07) | Lokal | Nur im Workout sichtbar |
| Sheet offen/zu, Toast, aktives Segment | Lokal | Reine UI-Zustände |
| `auth` (Token, eingeloggt) | Global | Entscheidet Onboarding vs. Tabs |
| `profile` + `dailyGoal` | Global | Home, 03, 08 und die Berechnung nutzen sie |
| `today` (Mahlzeiten, Wasser, Schlaf, Habit-Checks) | Global | Home und Modal 05 ändern dieselben Summen |
| `activeWorkout` | Global | Läuft weiter, wenn man 07 verlässt |
| `settings` (Theme, Einheiten, Erinnerungen) | Global | Wirkt auf die ganze App |
| `syncQueue` | Global | Offline-Änderungen bis zum nächsten Upload |

**Local Storage (AsyncStorage bzw. SQLite):** Profil, Ziel, Settings und alle Einträge werden sofort lokal gespeichert, damit die App offline funktioniert. Das Login-Token liegt im SecureStore, nicht im normalen Speicher. Der Onboarding-Status (`onboardingDone`) entscheidet beim Start, welcher Stack erscheint.

**API-Interaktionen:**

- `POST /auth/login`, `/auth/register`: beim Login bzw. nach dem Onboarding
- `GET/PUT /profile`, `/goal`: Laden beim Start, Speichern nach 02, 03 und 08
- `GET /entries?date=` und `POST/DELETE /meals`, `/water`, `/habits/checks`: Tagesdaten; Änderungen optimistisch (UI sofort, Upload danach, bei Fehler zurückrollen)
- `GET /foods?query=`: Lebensmittelsuche in 05, mit 300 ms Verzögerung nach der letzten Eingabe
- `POST /workouts`: beim «Workout beenden»

**Weitere Side-Effekte:** Pull-to-Refresh auf Home lädt den Tag neu; Wasser-Erinnerungen laufen als lokale Push-Notifications; der Health-Sync (Apple Health / Health Connect) liest Schlaf und Schritte beim App-Start und beim Refresh; die `syncQueue` wird hochgeladen, sobald wieder Netz da ist.
