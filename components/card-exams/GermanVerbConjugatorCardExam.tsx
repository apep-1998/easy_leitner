import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "../themed-text-input";
import { Card, GermanVerbConjugatorCardConfig } from "@/types";
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

interface GermanVerbConjugatorCardExamProps {
  card: Card;
}

const GermanVerbConjugatorCardExam: React.FC<
  GermanVerbConjugatorCardExamProps
> = ({ card }) => {
  const config = card.config as GermanVerbConjugatorCardConfig;
  const player = useAudioPlayer(config.pronunciation_file_url);

  const [ich, setIch] = useState("");
  const [du, setDu] = useState("");
  const [erSieEs, setErSieEs] = useState("");
  const [wir, setWir] = useState("");
  const [ihr, setIhr] = useState("");
  const [sie, setSie] = useState("");
  const [isCorrecting, setIsCorrecting] = useState<boolean | null>(null);
  const [isIncorrectReview, setIsIncorrectReview] = useState(false);

  useEffect(() => {
    setIch("");
    setDu("");
    setErSieEs("");
    setWir("");
    setIhr("");
    setSie("");
    setIsCorrecting(null);
    setIsIncorrectReview(false);
  }, [card]);

  useEffect(() => {
    if (player && config.pronunciation_file_url) {
      player.play();
    }
  }, [player]);

  if (card.config.type !== "german-verb-conjugator") {
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
    const isIchCorrect =
      ich.trim().toLowerCase() === config.ich.trim().toLowerCase();
    const isDuCorrect =
      du.trim().toLowerCase() === config.du.trim().toLowerCase();
    const isErSieEsCorrect =
      erSieEs.trim().toLowerCase() === config["er/sie/es"].trim().toLowerCase();
    const isWirCorrect =
      wir.trim().toLowerCase() === config.wir.trim().toLowerCase();
    const isIhrCorrect =
      ihr.trim().toLowerCase() === config.ihr.trim().toLowerCase();
    const isSieCorrect =
      sie.trim().toLowerCase() === config.sie.trim().toLowerCase();

    if (
      isIchCorrect &&
      isDuCorrect &&
      isErSieEsCorrect &&
      isWirCorrect &&
      isIhrCorrect &&
      isSieCorrect
    ) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.verb}>{config.verb}</ThemedText>
      {config.pronunciation_file_url && (
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
      )}

      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>ich</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setIch}
          value={ich}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>du</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setDu}
          value={du}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>er/sie/es</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setErSieEs}
          value={erSieEs}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>wir</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setWir}
          value={wir}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>ihr</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setIhr}
          value={ihr}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      <ThemedView style={styles.inputRow}>
        <ThemedText style={styles.pronoun}>sie</ThemedText>
        <ThemedTextInput
          style={styles.input}
          onChangeText={setSie}
          value={sie}
          autoCapitalize="none"
          editable={!isCorrecting && !isIncorrectReview}
        />
      </ThemedView>
      {!isCorrecting && !isIncorrectReview && (
        <TouchableOpacity onPress={checkAnswer} style={styles.checkButton}>
          <ThemedText style={styles.checkButtonText}>Check Answer</ThemedText>
        </TouchableOpacity>
      )}
      {isIncorrectReview && (
        <ThemedView style={styles.incorrectContainer}>
          <ThemedText style={styles.correctAnswerText}>
            Correct answers:
          </ThemedText>
          <ThemedText>ich: {config.ich}</ThemedText>
          <ThemedText>du: {config.du}</ThemedText>
          <ThemedText>er/sie/es: {config["er/sie/es"]}</ThemedText>
          <ThemedText>wir: {config.wir}</ThemedText>
          <ThemedText>ihr: {config.ihr}</ThemedText>
          <ThemedText>sie: {config.sie}</ThemedText>
          <TouchableOpacity
            onPress={onDoneIncorrect}
            style={styles.checkButton}
          >
            <ThemedText style={styles.checkButtonText}>Done Review</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      {isCorrecting && <FeedbackOverlay isCorrect onDone={() => {}} />}
    </ThemedView>
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
  verb: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    width: "80%",
  },
  pronoun: {
    width: 80,
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
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

export default GermanVerbConjugatorCardExam;
