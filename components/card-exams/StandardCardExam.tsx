import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Card, StandardCardConfig } from "@/types";

interface StandardCardExamProps {
  card: Card;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const StandardCardExam: React.FC<StandardCardExamProps> = ({
  card,
  onCorrect,
  onIncorrect,
}) => {
  const config = card.config as StandardCardConfig;
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setShowAnswer(false);
  }, [card]);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.question}>{config.front}</ThemedText>
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
      {showAnswer && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onCorrect}
            style={[styles.button, styles.correctButton]}
          >
            <ThemedText style={styles.buttonText}>Correct</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onIncorrect}
            style={[styles.button, styles.incorrectButton]}
          >
            <ThemedText style={styles.buttonText}>Incorrect</ThemedText>
          </TouchableOpacity>
        </View>
      )}
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

export default StandardCardExam;
