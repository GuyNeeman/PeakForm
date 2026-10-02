// App settings from the profile (08 → EINSTELLUNGEN)

export const WATER_INTERVALS = [1, 2, 3]; // hours

interface Settings {
  waterReminder: boolean; // remind me to drink (until today's water goal is reached)
  waterInterval: number; // every 1, 2 or 3 hours (between 08:00 and 20:00)
}

export const DEFAULT_SETTINGS: Settings = {
  waterReminder: false,
  waterInterval: 2,
};

export default Settings;
