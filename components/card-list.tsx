import { Modal, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { Card } from "@/types";
import { formatDistanceToNow } from "@/utils/time";

const CardItem = ({ card }: { card: Card }) => {
  const renderCardSpecifics = () => {
    switch (card.config.type) {
      case "spelling":
        return <ThemedText>Spelling: {card.config.spelling}</ThemedText>;
      case "standard":
        return <ThemedText>Front: {card.config.front}</ThemedText>;
      case "word-standard":
        return <ThemedText>Word: {card.config.word}</ThemedText>;
      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.cardContainer}>
      <ThemedText>Level: {card.level}</ThemedText>
      <ThemedText>
        Next Review: {formatDistanceToNow(card.nextReviewTime)}
      </ThemedText>
      <ThemedText>Type: {card.config.type}</ThemedText>
      {renderCardSpecifics()}
    </ThemedView>
  );
};

export const CardListModal = ({
  visible,
  onClose,
  cards,
}: {
  visible: boolean;
  onClose: () => void;
  cards: Card[];
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.centeredView}>
        <ThemedView style={styles.modalView}>
          <ThemedText style={styles.modalText}>Cards</ThemedText>
          <FlatList
            data={cards}
            renderItem={({ item }) => <CardItem card={item} />}
            keyExtractor={(item) => item.id || ""}
            style={{ width: "100%" }}
          />
          <TouchableOpacity
            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
            onPress={onClose}
          >
            <ThemedText style={styles.textStyle}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  cardContainer: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
