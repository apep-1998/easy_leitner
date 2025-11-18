import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { Card } from "@/types";
import StandardCardExam from "@/components/card-exams/StandardCardExam";
import SpellingCardExam from "@/components/card-exams/SpellingCardExam";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { onReadyCardsSnapshot, setCardNextLevel } from "@/firebase/card";
import SafeScrollView from "@/components/safe-scroll-view";

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
  const [currentCard, setCurrentCard] = useState<Card | null>(null);

  useEffect(() => {
    if (typeof boxId === "string") {
      const unsubscribe = onReadyCardsSnapshot(boxId, setCards);
      return () => unsubscribe();
    }
  }, [boxId]);

  useEffect(() => {
    if (cards.length > 0) {
      setCurrentCard(cards[0]);
    } else {
      setCurrentCard(null);
    }
  }, [cards]);

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
  };

  const handleIncorrect = () => {
    if (currentCard?.id) {
      setCardNextLevel(currentCard.id, 0, new Date(), false);
    }
  };

  return (
    <SafeScrollView style={styles.container}>
      {cards.length === 0 && (
        <ThemedView
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText>No cards ready for review in this box.</ThemedText>
          <Link href="/(tabs)/boxes">
            <ThemedText type="link">Go to Box</ThemedText>
          </Link>
        </ThemedView>
      )}
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
    </SafeScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ExamScreen;
