interface UserBasics {
  name: string; // first name, used e.g. for "Hey Alex" on Home
  sex: "Weiblich" | "Männlich" | "Divers";
  age: number; // years
  height: number; // cm
  weight: number; // kg
  activity: "Wenig" | "Mittel" | "Viel";
  goal: "Abnehmen" | "Halten" | "Aufbauen";
}

export default UserBasics;
