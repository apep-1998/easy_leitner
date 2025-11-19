import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Card, WordStandardCardConfig } from "@/types";
import { setCardNextLevel } from "@/firebase/card";
import FeedbackOverlay from "../feedback-overlay";
import { useAudioPlayer } from "expo-audio";
import FontAwesome from "@expo/vector-icons/FontAwesome";

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

interface WordStandardCardExamProps {
  card: Card;
}

const WordStandardCardExam: React.FC<WordStandardCardExamProps> = ({
  card,
}) => {
  const config = card.config as WordStandardCardConfig;
  const player = useAudioPlayer(config.pronunciation_file);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState<boolean | null>(null);
  const [isIncorrectReview, setIsIncorrectReview] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
    setIsCorrecting(null);
    setIsIncorrectReview(false);
  }, [card]);

  useEffect(() => {
    player.play();
  }, [player]);

  const handleCorrect = () => {
    setIsCorrecting(true);
    setTimeout(() => {
      const level = card.level + 1;
      if (level > 7) {
        return;
      }
      const nextReviewDate = new Date();
      nextReviewDate.setHours(
        nextReviewDate.getHours() + MAPPE_LEVEL_TO_HOURS[level],
      );
      setCardNextLevel(card.id || "", level, nextReviewDate, true);
      setIsCorrecting(null);
    }, 700);
  };

  const handleIncorrect = () => {
    setIsIncorrectReview(true);
  };

  const onDoneIncorrect = () => {
    setCardNextLevel(card.id, 0, new Date(), false);
    setIsIncorrectReview(false);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.question}>{config.word}</ThemedText>
      <ThemedText style={styles.partOfSpeech}>
        {config.part_of_speech}
      </ThemedText>
      <TouchableOpacity
        onPress={() => {
          player.seekTo(0);
          player.play();
        }}
        disabled={player.playing}
      >
        <FontAwesome
          name={player.playing ? "volume-up" : "volume-down"}
          size={50}
          color="#007AFF"
        />
      </TouchableOpacity>

      {showAnswer ? (
        <ThemedText style={styles.answer}>{config.back}</ThemedText>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAnswer(true)}
          style={styles.showAnswerButton}
        >
          <ThemedText style={styles.showAnswerButtonText}>
            Show Answer
          </ThemedText>
        </TouchableOpacity>
      )}
      {showAnswer && !isCorrecting && !isIncorrectReview && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleCorrect}
            style={[styles.button, styles.correctButton]}
          >
            <ThemedText style={styles.buttonText}>Correct</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleIncorrect}
            style={[styles.button, styles.incorrectButton]}
          >
            <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      {isIncorrectReview && (
        <TouchableOpacity
          onPress={onDoneIncorrect}
          style={styles.showAnswerButton}
        >
          <ThemedText style={styles.showAnswerButtonText}>
            Done Review
          </ThemedText>
        </TouchableOpacity>
      )}
      {isCorrecting && <FeedbackOverlay isCorrect onDone={() => {}} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  partOfSpeech: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 20,
    textAlign: "center",
  },
  answer: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  showAnswerButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  showAnswerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    width: "40%",
    alignItems: "center",
  },
  correctButton: {
    backgroundColor: "green",
  },
  incorrectButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default WordStandardCardExam;
