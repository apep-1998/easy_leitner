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

export default function WordStandardCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData,
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  initialData?: {
    word?: string;
    part_of_speech?: string;
    back?: string;
    pronunciation_file?: string;
  };
}) {
  const [word, setWord] = useState(initialData?.word || "");
  const [partOfSpeech, setPartOfSpeech] = useState(
    initialData?.part_of_speech || "",
  );
  const [back, setBack] = useState(initialData?.back || "");
  const [pronunciationFile, setPronunciationFile] = useState(
    initialData?.pronunciation_file || "",
  );
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    onChange({
      word,
      part_of_speech: partOfSpeech,
      back,
      pronunciation_file: pronunciationFile,
    });
    setIsReadyToSubmit(
      !!word && !!partOfSpeech && !!back && !!pronunciationFile,
    );
  }, [word, partOfSpeech, back, pronunciationFile, onChange, setIsReadyToSubmit]);

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
      setPronunciationFile(downloadURL);
    } catch (error) {
      console.error("Error uploading audio: ", error);
      Alert.alert("Error", "Failed to upload audio.");
    }
  }

  return (
    <ThemedView>
      <ThemedText>Word</ThemedText>
      <ThemedTextInput
        placeholder="Word"
        style={styles.input}
        value={word}
        onChangeText={setWord}
      />
      <ThemedText>Part of Speech</ThemedText>
      <ThemedTextInput
        placeholder="Part of Speech"
        style={styles.input}
        value={partOfSpeech}
        onChangeText={setPartOfSpeech}
      />
      <ThemedText>Back</ThemedText>
      <ThemedTextInput
        placeholder="Back of the card"
        style={styles.input}
        value={back}
        onChangeText={setBack}
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
      {pronunciationFile ? (
        <ThemedText>Audio URL: {pronunciationFile}</ThemedText>
      ) : null}
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
