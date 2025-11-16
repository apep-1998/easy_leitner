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

export default function SpellingCardForm({
  onChange,
  setIsReadyToSubmit,
}: {
  onChange: (data: any) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
}) {
  const [spelling, setSpelling] = useState("");
  const [voice_file_url, setVoiceFileUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    onChange({ spelling, voice_file_url });
    setIsReadyToSubmit(!!spelling && !!voice_file_url);
  }, [spelling, voice_file_url]);

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
      setVoiceFileUrl(downloadURL);
      setIsReadyToSubmit(true);
    } catch (error) {
      console.error("Error uploading audio: ", error);
      Alert.alert("Error", "Failed to upload audio.");
    }
  }

  return (
    <ThemedView>
      <ThemedText>Spelling</ThemedText>
      <ThemedTextInput
        placeholder="Spelling"
        style={styles.input}
        value={spelling}
        onChangeText={setSpelling}
      />
      <ThemedText>Voice</ThemedText>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={styles.recordButton}
      >
        <ThemedText>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </ThemedText>
      </TouchableOpacity>
      {voice_file_url ? (
        <ThemedText>Audio URL: {voice_file_url}</ThemedText>
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
