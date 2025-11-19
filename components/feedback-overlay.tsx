import React from "react";
import { View, StyleSheet, Modal } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

interface FeedbackOverlayProps {
  isCorrect: boolean;
  onDone: () => void;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  isCorrect,
  onDone,
}) => {
  if (!isCorrect) {
    return null;
  }
  return (
    <Modal transparent visible>
      <View style={styles.overlay}>
        <FontAwesome
          name="check-circle"
          size={100}
          color="green"
          backgroundColor="rgba(0, 0, 0, 1)"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default FeedbackOverlay;
