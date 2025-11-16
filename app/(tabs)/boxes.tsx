import {
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  onBoxesSnapshot,
  addBox as addBoxToFirebase,
  deleteBox as deleteBoxFromFirebase,
  onCardsSnapshotInBox,
} from "@/firebase/box";

import { Box } from "@/types";

const BoxItem = (box: Box) => {
  const router = useRouter();
  const [numberOfReadyCards, setNumberOfReadyCards] = useState(0);
  const [numberOfCards, setNumberOfCards] = useState(0);

  useEffect(() => {
    if (box.id) {
      const unsubscribe = onCardsSnapshotInBox(box.id, (cards) => {
        setNumberOfReadyCards(
          cards.filter(
            (card) => card.nextReviewTime.toDate() <= new Date()
          ).length
        );
        setNumberOfCards(cards.length);
      });
      return () => unsubscribe();
    }
  }, [box.id]);

  const handleDeleteBox = async () => {
    if (box.id) {
      await deleteBoxFromFirebase(box.id);
    }
  };

  const goToExam = () => {
    router.push({
      pathname: "/exam",
      params: { boxId: box.id },
    });
  };

  return (
    <ThemedView style={styles.boxContainer}>
      <ThemedView>
        <ThemedText type="title">{box.name}</ThemedText>
        <ThemedView style={{ flexDirection: "row", paddingTop: 10 }}>
          <ThemedView
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons
              name="cards-outline"
              size={16}
              color="white"
            />
            <ThemedText type="small">{numberOfCards}</ThemedText>
            <ThemedText type="small">Total</ThemedText>
          </ThemedView>
          <ThemedView
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons
              name="cards-outline"
              size={16}
              color="white"
            />
            <ThemedText type="small">{numberOfReadyCards}</ThemedText>
            <ThemedText type="small">Ready</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.boxActionContainer}>
        <TouchableOpacity onPress={handleDeleteBox}>
          <FontAwesome name="trash" size={30} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToExam}>
          <FontAwesome name="play" size={30} color={"green"} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

export default function HomeScreen() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoxName, setNewBoxName] = useState("");

  useEffect(() => {
    const unsubscribe = onBoxesSnapshot(setBoxes);
    return () => unsubscribe();
  }, []);

  const handleAddBox = async () => {
    if (newBoxName.trim() === "") {
      Alert.alert("Error", "Please enter a name for the box");
      return;
    }
    try {
      await addBoxToFirebase(newBoxName);
      setNewBoxName("");
      setModalVisible(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <ThemedView style={styles.centeredView}>
            <ThemedView style={styles.modalView}>
              <ThemedText style={styles.modalText}>Add New Box</ThemedText>
              <ThemedTextInput
                placeholder="Box Name"
                style={{
                  width: "90%",
                  height: 40,
                  borderColor: "gray",
                  borderWidth: 1,
                  marginBottom: 12,
                  paddingLeft: 8,
                }}
                onChangeText={setNewBoxName}
                value={newBoxName}
                autoCapitalize="none"
              />
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "80%",
                }}
              >
                <TouchableOpacity
                  style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                  onPress={handleAddBox}
                >
                  <ThemedText style={styles.textStyle}>Add Box</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...styles.openButton,
                    backgroundColor: "red",
                  }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <ThemedText style={styles.textStyle}>Cancel</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>
        <FlatList
          data={boxes}
          renderItem={(item) => <BoxItem {...item.item} />}
          keyExtractor={(item) => item.id || ""}
        />
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome name="plus" size={30} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 25,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
  boxActionContainer: {
    minWidth: 70,
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    flexDirection: "row",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    marginTop: 10,
  },
  modalView: {
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center",
    elevation: 5,
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
