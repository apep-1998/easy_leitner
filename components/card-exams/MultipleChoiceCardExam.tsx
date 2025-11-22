import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Card, MultipleChoiceCardConfig } from "@/types";
import { FontAwesome } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
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

interface MultipleChoiceCardExamProps {
  card: Card;
}

const MultipleChoiceCardExam: React.FC<MultipleChoiceCardExamProps> = ({
  card,
}) => {
  const config = card.config as MultipleChoiceCardConfig;
  const player = useAudioPlayer(config.voice_file_url);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState<boolean | null>(null);
  const [isIncorrectReview, setIsIncorrectReview] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrecting(null);
    setIsIncorrectReview(false);

    // Shuffle options
    const options = [...config.options];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    setShuffledOptions(options);
  }, [card]);

  const playSound = () => {
    player.seekTo(0);
    player.play();
  };

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

  const handleOptionPress = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);
    if (option === config.answer) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.question}>{config.question}</ThemedText>
      {config.image_url && (
        <Image source={{ uri: config.image_url }} style={styles.image} />
      )}
      {config.voice_file_url && (
        <TouchableOpacity
          onPress={playSound}
          style={styles.audioButton}
          disabled={player.playing}
        >
          <FontAwesome
            name={player.playing ? "volume-up" : "volume-down"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      )}
      {!isIncorrectReview && (
        <View style={styles.optionsContainer}>
          {shuffledOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isAnswered && option === config.answer && styles.correctOption,
                isAnswered &&
                  selectedOption === option &&
                  option !== config.answer &&
                  styles.incorrectOption,
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={isAnswered}
            >
              <ThemedText>{option}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
       {isIncorrectReview && (
        <View style={styles.incorrectContainer}>
          <ThemedText style={styles.correctAnswerText}>
            Correct answer: {config.answer}
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
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  audioButton: {
    marginBottom: 20,
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  correctOption: {
    backgroundColor: "green",
  },
  incorrectOption: {
    backgroundColor: "red",
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

export default MultipleChoiceCardExam;
