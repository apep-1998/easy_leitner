import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";

import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import StandardCardForm from "@/components/card-forms/StandardCardForm";
import SpellingCardForm from "@/components/card-forms/SpellingCardForm";
import { Box } from "@/types";
import { ThemedPicker } from "@/components/themed-picker";
import { onBoxesSnapshot } from "@/firebase/box";
import { addCard as addCardToFirebase } from "@/firebase/card";

type CardType = "standard" | "spelling";

export default function AddCardScreen() {
  const [cardType, setCardType] = useState<CardType>("standard");
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [cardData, setCardData] = useState({});
  const [formKey, setFormKey] = useState(1);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  useEffect(() => {
    const unsubscribe = onBoxesSnapshot(setBoxes);
    return () => unsubscribe();
  }, []);

  const handleAddCard = async () => {
    if (!selectedBox) {
      Alert.alert("Error", "Please select a box");
      return;
    }
    try {
      await addCardToFirebase(selectedBox, cardType, cardData);
      Alert.alert("Success", "Card added successfully");
      setCardData({});
      setFormKey((prevKey) => prevKey + 1);
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert("Error", "There was an error adding the card");
    }
  };

  const boxItems = boxes.map((box) => ({
    label: box.name,
    value: box.id,
  }));

  return (
    <SafeScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Add New Card</ThemedText>

        <ThemedPicker
          onValueChange={(value) => setCardType(value)}
          items={[
            { label: "Standard", value: "standard" },
            { label: "Spelling", value: "spelling" },
          ]}
          value={cardType}
        />

        <ThemedPicker
          onValueChange={(value) => setSelectedBox(value)}
          items={boxItems}
          placeholder={{ label: "Select a box", value: null }}
          value={selectedBox}
        />

        {cardType === "standard" ? (
          <StandardCardForm
            key={formKey}
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
          />
        ) : (
          <SpellingCardForm
            key={formKey}
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
          />
        )}

        <TouchableOpacity
          onPress={handleAddCard}
          style={[
            styles.saveButton,
            {
              backgroundColor: isReadyToSubmit ? "#007AFF" : "#999999",
              opacity: isReadyToSubmit ? 1 : 0.5,
            },
          ]}
          disabled={!isReadyToSubmit}
        >
          <ThemedText style={styles.saveButtonText}>Save Card</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
