// src/app/(onboarding)/basics.tsx – 02 Basic info
// The form itself is in src/components/BasicsForm.tsx (also used for "Grundwerte bearbeiten").

import { BasicsForm } from "@/components/BasicsForm";
import { useApp } from "@/context/AppContext";
import { useRouter } from "expo-router";

export default function Basics() {
  const { updateUser } = useApp();
  const router = useRouter();

  return (
    <BasicsForm
      title="Erzähl uns von dir"
      submitLabel="Weiter"
      onSubmit={(basics) => {
        updateUser(basics);
        router.push("/goal");
      }}
    />
  );
}
