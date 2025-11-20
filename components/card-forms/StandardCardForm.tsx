import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function StandardCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData,
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  initialData?: {
    front?: string;
    back?: string;
  };
}) {
  const [front, setFront] = useState(initialData?.front || "");
  const [back, setBack] = useState(initialData?.back || "");

  useEffect(() => {
    onChange({ front, back });
    setIsReadyToSubmit(front.trim() !== "" && back.trim() !== "");
  }, [front, back, onChange, setIsReadyToSubmit]);

  return (
    <ThemedView>
      <ThemedText>Front</ThemedText>
      <ThemedTextInput
        placeholder="Front of the card"
        style={styles.input}
        value={front}
        onChangeText={setFront}
      />
      <ThemedText>Back</ThemedText>
      <ThemedTextInput
        placeholder="Back of the card"
        style={styles.input}
        value={back}
        onChangeText={setBack}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});
