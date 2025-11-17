import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "../themed-text-input";
import { Card, SpellingCardConfig } from "@/types";
import { useAudioPlayer } from "expo-audio";
import FontAwesome from "@expo/vector-icons/FontAwesome";
interface SpellingCardExamProps {
  card: Card;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const SpellingCardExam: React.FC<SpellingCardExamProps> = ({
  card,
  onCorrect,
  onIncorrect,
}) => {
  const config = card.config as SpellingCardConfig;
  const player = useAudioPlayer(config.voice_file_url);
  const [userSpelling, setUserSpelling] = useState("");

  useEffect(() => {
    setUserSpelling("");
  }, [card]);

  if (card.config.type !== "spelling") {
    return null;
  }

  const checkAnswer = () => {
    if (userSpelling.toLowerCase() === config.spelling.toLowerCase()) {
      onCorrect();
    } else {
      onIncorrect();
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
      />
      <TouchableOpacity onPress={checkAnswer} style={styles.checkButton}>
        <ThemedText style={styles.checkButtonText}>Check Answer</ThemedText>
      </TouchableOpacity>
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
});

export default SpellingCardExam;
