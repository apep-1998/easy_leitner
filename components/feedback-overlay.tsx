import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Text } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ThemedText } from "./themed-text";

interface FeedbackOverlayProps {
  message: string;
  onDismiss: () => void;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  message,
  onDismiss,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2000); // Automatically dismiss after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) {
    return null;
  }

  return (
    <Modal transparent visible>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <FontAwesome
            name="check-circle"
            size={100}
            color="green"
            backgroundColor="rgba(0, 0, 0, 1)"
          />
          <ThemedText>{message}</ThemedText>
        </View>
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
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  }
});

export default FeedbackOverlay;
