interface UserBasics {
  sex: "Weiblich" | "Männlich" | "Divers";
  age: number; // years
  height: number; // cm
  weight: number; // kg
  activity: "Wenig" | "Mittel" | "Viel";
  goal: "Abnehmen" | "Halten" | "Aufbauen";
}

export default UserBasics;
