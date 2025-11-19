import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { Card } from "@/types";
import StandardCardExam from "@/components/card-exams/StandardCardExam";
import WordStandardCardExam from "@/components/card-exams/WordStandardCardExam";
import SpellingCardExam from "@/components/card-exams/SpellingCardExam";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { onReadyCardsSnapshot } from "@/firebase/card";
import SafeScrollView from "@/components/safe-scroll-view";

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
        <StandardCardExam card={currentCard} />
      )}
      {currentCard?.config.type === "spelling" && (
        <SpellingCardExam card={currentCard} />
      )}
      {currentCard?.config.type === "word-standard" && (
        <WordStandardCardExam card={currentCard} />
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
