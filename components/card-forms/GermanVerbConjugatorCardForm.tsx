import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  RecordingPresets,
} from "expo-audio";
import { uploadAudio as uploadAudioToFirebase } from "@/firebase/storage";

export default function GermanVerbConjugatorCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData,
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  initialData?: {
    verb?: string;
    pronunciation_file_url?: string;
    ich?: string;
    du?: string;
    "er/sie/es"?: string;
    wir?: string;
    ihr?: string;
    sie?: string;
  };
}) {
  const [verb, setVerb] = useState(initialData?.verb || "");
  const [pronunciationFileUrl, setPronunciationFileUrl] = useState(
    initialData?.pronunciation_file_url || null,
  );
  const [ich, setIch] = useState(initialData?.ich || "");
  const [du, setDu] = useState(initialData?.du || "");
  const [erSieEs, setErSieEs] = useState(initialData?.["er/sie/es"] || "");
  const [wir, setWir] = useState(initialData?.wir || "");
  const [ihr, setIhr] = useState(initialData?.ihr || "");
  const [sie, setSie] = useState(initialData?.sie || "");
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    onChange({
      verb,
      pronunciation_file_url: pronunciationFileUrl,
      ich,
      du,
      "er/sie/es": erSieEs,
      wir,
      ihr,
      sie,
    });
    setIsReadyToSubmit(
      !!verb && !!ich && !!du && !!erSieEs && !!wir && !!ihr && !!sie,
    );
  }, [verb, pronunciationFileUrl, ich, du, erSieEs, wir, ihr, sie, onChange, setIsReadyToSubmit]);

  async function startRecording() {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please grant permission to use the microphone.",
      );
      return;
    }
    try {
      await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      recorder.record();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      await recorder.stop();
      setIsRecording(false);
      if (recorder.uri) {
        handleUploadAudio(recorder.uri);
      }
    } catch (error) {
      console.error("Failed to stop recording", error);
    }
  }

  async function handleUploadAudio(uri: string) {
    try {
      const downloadURL = await uploadAudioToFirebase(uri);
      setPronunciationFileUrl(downloadURL);
    } catch (error) {
      console.error("Error uploading audio: ", error);
      Alert.alert("Error", "Failed to upload audio.");
    }
  }

  return (
    <ThemedView>
      <ThemedText>Verb</ThemedText>
      <ThemedTextInput
        placeholder="Verb"
        style={styles.input}
        value={verb}
        onChangeText={setVerb}
      />
      <ThemedText>Pronunciation</ThemedText>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={styles.recordButton}
      >
        <ThemedText>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </ThemedText>
      </TouchableOpacity>
      {pronunciationFileUrl ? (
        <ThemedText>Audio URL: {pronunciationFileUrl}</ThemedText>
      ) : null}
      <ThemedText>ich</ThemedText>
      <ThemedTextInput
        placeholder="ich"
        style={styles.input}
        value={ich}
        onChangeText={setIch}
      />
      <ThemedText>du</ThemedText>
      <ThemedTextInput
        placeholder="du"
        style={styles.input}
        value={du}
        onChangeText={setDu}
      />
      <ThemedText>er/sie/es</ThemedText>
      <ThemedTextInput
        placeholder="er/sie/es"
        style={styles.input}
        value={erSieEs}
        onChangeText={setErSieEs}
      />
      <ThemedText>wir</ThemedText>
      <ThemedTextInput
        placeholder="wir"
        style={styles.input}
        value={wir}
        onChangeText={setWir}
      />
      <ThemedText>ihr</ThemedText>
      <ThemedTextInput
        placeholder="ihr"
        style={styles.input}
        value={ihr}
        onChangeText={setIhr}
      />
      <ThemedText>sie</ThemedText>
      <ThemedTextInput
        placeholder="sie"
        style={styles.input}
        value={sie}
        onChangeText={setSie}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  recordButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
});
