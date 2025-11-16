import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Card } from "@/types";
import StandardCardExam from "@/components/card-exams/StandardCardExam";
import SpellingCardExam from "@/components/card-exams/SpellingCardExam";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { onReadyCardsSnapshot, setCardNextLevel } from "@/firebase/card";

const MAPPE_LEVEL_TO_HOURS: Record<number, number> = {
  0: 0,
  1: 4,
  2: 24,
  3: 48,
  4: 96,
  5: 192,
  6: 384,
  7: 1000000000,
};

const ExamScreen = () => {
  const { boxId } = useLocalSearchParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof boxId === "string") {
      const unsubscribe = onReadyCardsSnapshot(boxId, setCards);
      return () => unsubscribe();
    }
  }, [boxId]);

  useEffect(() => {
    if (cards.length > 0) {
      setCurrentCard(cards[0]);
    }
  }, [cards]);

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setCurrentCard(cards[currentCardIndex + 1]);
    } else {
      Alert.alert("Congratulations!", "You have finished all the cards.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  };

  const handleCorrect = () => {
    if (currentCard?.id) {
      const level = currentCard.level + 1;
      if (level > 7) {
        return;
      }
      const nextReviewDate = new Date();
      nextReviewDate.setHours(
        nextReviewDate.getHours() + MAPPE_LEVEL_TO_HOURS[level],
      );
      setCardNextLevel(currentCard.id, level, nextReviewDate, true);
    }
    handleNextCard();
  };

  const handleIncorrect = () => {
    if (currentCard?.id) {
      setCardNextLevel(currentCard.id, 0, new Date(), false);
    }
    handleNextCard();
  };

  if (cards.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No cards ready for review in this box.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {currentCard?.config.type === "standard" && (
        <StandardCardExam
          card={currentCard}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      )}
      {currentCard?.config.type === "spelling" && (
        <SpellingCardExam
          card={currentCard}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ExamScreen;
