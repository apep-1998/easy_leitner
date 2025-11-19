import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "../themed-text-input";
import { Card, SpellingCardConfig } from "@/types";
import { useAudioPlayer } from "expo-audio";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { setCardNextLevel } from "@/firebase/card";
import FeedbackOverlay from "../feedback-overlay";

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

interface SpellingCardExamProps {
  card: Card;
}

const SpellingCardExam: React.FC<SpellingCardExamProps> = ({ card }) => {
  const config = card.config as SpellingCardConfig;
  const player = useAudioPlayer(config.voice_file_url);
  const [userSpelling, setUserSpelling] = useState("");
  const [isCorrecting, setIsCorrecting] = useState<boolean | null>(null);
  const [isIncorrectReview, setIsIncorrectReview] = useState(false);

  useEffect(() => {
    setUserSpelling("");
    setIsCorrecting(null);
    setIsIncorrectReview(false);
  }, [card]);

  useEffect(() => {
    player.play();
  }, [player]);

  if (card.config.type !== "spelling") {
    return null;
  }

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
    setCardNextLevel(card.id || "", 0, new Date(), false);
    setIsIncorrectReview(false);
  };

  const checkAnswer = () => {
    if (userSpelling.toLowerCase() === config.spelling.toLowerCase()) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  return (
    <View style={styles.container}>
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

      <ThemedTextInput
        style={styles.input}
        onChangeText={setUserSpelling}
        value={userSpelling}
        placeholder="Enter spelling"
        autoCapitalize="none"
        editable={!isCorrecting && !isIncorrectReview}
      />
      {!isCorrecting && !isIncorrectReview && (
        <TouchableOpacity onPress={checkAnswer} style={styles.checkButton}>
          <ThemedText style={styles.checkButtonText}>Check Answer</ThemedText>
        </TouchableOpacity>
      )}
      {isIncorrectReview && (
        <View style={styles.incorrectContainer}>
          <ThemedText style={styles.correctAnswerText}>
            Correct answer: {config.spelling}
          </ThemedText>
          <TouchableOpacity
            onPress={onDoneIncorrect}
            style={styles.checkButton}
          >
            <ThemedText style={styles.checkButtonText}>Done Review</ThemedText>
          </TouchableOpacity>
        </View>
      )}
      {isCorrecting && <FeedbackOverlay isCorrect onDone={() => {}} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 20,
    width: "80%",
    paddingHorizontal: 10,
  },
  checkButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  checkButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  incorrectContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  correctAnswerText: {
    fontSize: 20,
    color: "red",
    marginBottom: 20,
  },
});

export default SpellingCardExam;
