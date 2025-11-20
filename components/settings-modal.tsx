import React, { useState, useEffect } from "react";
import { Modal, StyleSheet, TouchableHighlight, View } from "react-native";
import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { ThemedTextInput } from "./themed-text-input";
import { getUserToken, updateUserToken } from "@/firebase/user";
import FeedbackOverlay from "./feedback-overlay";
import Entypo from "@expo/vector-icons/Entypo";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({
  visible,
  onClose,
}: SettingsModalProps) {
  const [token, setToken] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (visible) {
      const fetchToken = async () => {
        const userToken = await getUserToken();
        setToken(userToken);
      };
      fetchToken();
    }
  }, [visible]);

  const onSaveToken = async () => {
    try {
      await updateUserToken(token);
      setFeedback("Token saved successfully!");
    } catch (error) {
      setFeedback("Error saving token.");
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <FeedbackOverlay message={feedback} onDismiss={() => setFeedback("")} />
      <View style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <TouchableHighlight
            onPress={onClose}
            style={styles.closeButton}
          >
            <Entypo name="cross" size={24} color="white" />
          </TouchableHighlight>
          <ThemedText style={{ marginBottom: 8 }}>AI Token</ThemedText>
          <ThemedTextInput
            value={token}
            onChangeText={setToken}
            placeholder="Enter your AI token"
            style={{ marginBottom: 16 }}
          />
          <TouchableHighlight
            onPress={onSaveToken}
            style={{
              backgroundColor: "#007BFF",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <ThemedText style={{ color: "white" }}>Save Token</ThemedText>
          </TouchableHighlight>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  }
});
