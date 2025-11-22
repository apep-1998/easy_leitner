import {
  FlatList,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { auth } from "@/firebaseConfig";
import { importBox } from "@/firebase/functions";

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
  updateBox,
} from "@/firebase/box";
import { exportBox } from "@/firebase/functions";

import { Box } from "@/types";

const BoxItem = (box: Box) => {
  const router = useRouter();
  const [numberOfReadyCards, setNumberOfReadyCards] = useState(0);
  const [numberOfCards, setNumberOfCards] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [dailyNewCardLimit, setDailyNewCardLimit] = useState(
    box.dailyNewCardLimit?.toString() || "0",
  );

  useEffect(() => {
    if (box.id) {
      const unsubscribe = onCardsSnapshotInBox(box.id, (cards) => {
        setNumberOfReadyCards(
          cards.filter((card) => card.nextReviewTime.toDate() <= new Date())
            .length,
        );
        setNumberOfCards(cards.length);
      });
      return () => unsubscribe();
    }
  }, [box.id]);

  const handleDeleteBox = () => {
    Alert.alert(
      "Delete Box",
      `Are you sure you want to delete this box? This will also delete ${numberOfCards} card(s).`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            if (box.id) {
              await deleteBoxFromFirebase(box.id);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const goToExam = () => {
    router.push({
      pathname: "/exam",
      params: { boxId: box.id },
    });
  };

  const handleShowCards = () => {
    router.push({
      pathname: "/cards",
      params: { boxId: box.id },
    });
  };

  const handleExportBox = async () => {
    if (!box.id) return;
    setIsExporting(true);
    try {
      const result: any = await exportBox({ boxId: box.id });
      const { downloadUrl } = result.data;

      const localUri = FileSystem.documentDirectory + `${box.name}.zip`;
      const { uri } = await FileSystem.downloadAsync(downloadUrl, localUri);
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to export box.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!box.id) return;

    const limit = parseInt(dailyNewCardLimit, 10);
    if (isNaN(limit)) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }

    try {
      await updateBox(box.id, { dailyNewCardLimit: limit });
      setSettingsModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  return (
    <ThemedView style={styles.boxContainer}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSettingsModalVisible}
        onRequestClose={() => {
          setSettingsModalVisible(!isSettingsModalVisible);
        }}
      >
        <ThemedView style={styles.centeredView}>
          <ThemedView style={styles.modalView}>
            <ThemedText style={styles.modalText}>Box Settings</ThemedText>
            <ThemedTextInput
              placeholder="Daily New Card Limit"
              style={{
                width: "90%",
                height: 40,
                borderColor: "gray",
                borderWidth: 1,
                marginBottom: 12,
                paddingLeft: 8,
              }}
              onChangeText={setDailyNewCardLimit}
              value={dailyNewCardLimit}
              keyboardType="numeric"
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
                onPress={handleSaveSettings}
              >
                <ThemedText style={styles.textStyle}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.openButton,
                  backgroundColor: "red",
                }}
                onPress={() => {
                  setSettingsModalVisible(false);
                }}
              >
                <ThemedText style={styles.textStyle}>Cancel</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
      <ThemedView
        style={{
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <ThemedText type="title">{box.name}</ThemedText>
        <ThemedView
          style={{
            flexDirection: "row",
            marginLeft: 10,
            marginTop: 10,
          }}
        >
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              style={{ marginRight: 5 }}
              name="cards-outline"
              size={20}
              color="white"
            />
            <ThemedText type="small">{numberOfCards} Total</ThemedText>
          </ThemedView>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            <MaterialCommunityIcons
              style={{ marginRight: 5 }}
              name="cards-outline"
              size={20}
              color="white"
            />
            <ThemedText type="small">{numberOfReadyCards} Ready</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.boxActionContainer}>
        <TouchableOpacity onPress={handleDeleteBox}>
          <FontAwesome name="trash" size={35} color="red" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
          <FontAwesome name="cog" size={35} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExportBox} disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <MaterialCommunityIcons name="export" size={35} color="#2196F3" />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShowCards}>
          <FontAwesome name="list" size={35} color={"#2196F3"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToExam}>
          <FontAwesome name="play" size={35} color={"green"} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

export default function HomeScreen() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoxName, setNewBoxName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [isImportModalVisible, setImportModalVisible] = useState(false);
  const [importBoxName, setImportBoxName] = useState("");
  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerResult | null>(null);

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

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/zip",
        copyToCacheDirectory: true,
      });

      if (res.canceled) {
        return;
      }
      setSelectedFile(res);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to select file.");
    }
  };

  const handleImport = async () => {
    if (!importBoxName.trim()) {
      Alert.alert("Error", "Please enter a name for the box.");
      return;
    }
    if (!selectedFile) {
      Alert.alert("Error", "Please select a file to import.");
      return;
    }

    if (selectedFile.canceled) {
      return;
    }

    setIsImporting(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      console.log("Importing box...");
      console.log(selectedFile, userId, importBoxName);
      await importBox(selectedFile.assets[0].uri, importBoxName, userId);
      Alert.alert("Success", "Box imported successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to import box.");
    } finally {
      setIsImporting(false);
      setImportModalVisible(false);
      setImportBoxName("");
      setSelectedFile(null);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isImportModalVisible}
          onRequestClose={() => {
            setImportModalVisible(!isImportModalVisible);
          }}
        >
          <ThemedView style={styles.centeredView}>
            <ThemedView style={styles.modalView}>
              <ThemedText style={styles.modalText}>Import Box</ThemedText>
              <ThemedTextInput
                placeholder="New Box Name"
                style={{
                  width: "90%",
                  height: 40,
                  borderColor: "gray",
                  borderWidth: 1,
                  marginBottom: 12,
                  paddingLeft: 8,
                }}
                onChangeText={setImportBoxName}
                value={importBoxName}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={{
                  ...styles.openButton,
                  backgroundColor: "#4CAF50",
                  marginTop: 10,
                }}
                onPress={handleFilePick}
              >
                <ThemedText style={styles.textStyle}>
                  {selectedFile && !selectedFile.canceled
                    ? selectedFile.assets[0].name
                    : "Select File"}
                </ThemedText>
              </TouchableOpacity>
              <ThemedView
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "80%",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                  onPress={handleImport}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <ThemedText style={styles.textStyle}>Import</ThemedText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...styles.openButton,
                    backgroundColor: "red",
                  }}
                  onPress={() => {
                    setImportModalVisible(false);
                  }}
                >
                  <ThemedText style={styles.textStyle}>Cancel</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>
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
        <TouchableOpacity
          style={styles.fabImport}
          onPress={() => setImportModalVisible(true)}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="import" size={30} color="white" />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
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
    minWidth: 100,
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
  fabImport: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 80, // Position it above the add button
    backgroundColor: "#4CAF50", // Different color
    borderRadius: 25,
    width: 50,
    height: 50,
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
