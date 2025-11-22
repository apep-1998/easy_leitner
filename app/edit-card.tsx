import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import StandardCardForm from "@/components/card-forms/StandardCardForm";
import SpellingCardForm from "@/components/card-forms/SpellingCardForm";
import WordStandardCardForm from "@/components/card-forms/WordStandardCardForm";
import GermanVerbConjugatorCardForm from "@/components/card-forms/GermanVerbConjugatorCardForm";
import MultipleChoiceCardForm from "@/components/card-forms/MultipleChoiceCardForm";
import { Box, Card } from "@/types";
import { getBox } from "@/firebase/box";
import { getCard, updateCard } from "@/firebase/card";

export default function EditCardScreen() {
  const { cardId } = useLocalSearchParams<{ cardId: string }>();
  const router = useRouter();
  const [card, setCard] = useState<Card | null>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [cardData, setCardData] = useState({});
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  useEffect(() => {
    if (cardId) {
      getCard(cardId)
        .then((fetchedCard) => {
          setCard(fetchedCard);
          if (fetchedCard.boxId) {
            getBox(fetchedCard.boxId).then(setBox);
          }
        })
        .catch((error) => {
          console.error("Error fetching card: ", error);
          Alert.alert("Error", "Could not fetch card data.");
        });
    }
  }, [cardId]);

  const handleUpdateCard = async () => {
    if (!card) return;
    try {
      await updateCard(card.id!, { ...card.config, ...cardData });
      Alert.alert("Success", "Card updated successfully");
      router.back();
    } catch (e) {
      console.error("Error updating document: ", e);
      Alert.alert("Error", "There was an error updating the card");
    }
  };

  const renderCardForm = () => {
    if (!card) return null;

    switch (card.config.type) {
      case "standard":
        return (
          <StandardCardForm
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
            initialData={card.config}
          />
        );
      case "spelling":
        return (
          <SpellingCardForm
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
            initialData={card.config}
          />
        );
      case "word-standard":
        return (
          <WordStandardCardForm
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
            initialData={card.config}
          />
        );
      case "german-verb-conjugator":
        return (
          <GermanVerbConjugatorCardForm
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
            initialData={card.config}
          />
        );
      case "multiple-choice":
        return (
          <MultipleChoiceCardForm
            onChange={setCardData}
            setIsReadyToSubmit={setIsReadyToSubmit}
            initialData={card.config}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Edit Card</ThemedText>

        <ThemedView style={styles.infoContainer}>
          <ThemedText>Box: {box?.name}</ThemedText>
          <ThemedText>Type: {card?.config.type}</ThemedText>
        </ThemedView>

        {renderCardForm()}

        <TouchableOpacity
          onPress={handleUpdateCard}
          style={[
            styles.saveButton,
            {
              backgroundColor: isReadyToSubmit ? "#007AFF" : "#999999",
              opacity: isReadyToSubmit ? 1 : 0.5,
            },
          ]}
          disabled={!isReadyToSubmit}
        >
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
  infoContainer: {
    marginVertical: 16,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#555",
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
