
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Button, Image, TouchableOpacity, Alert } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedTextInput } from "@/components/themed-text-input";
import { ThemedView } from "@/components/themed-view";
import { MultipleChoiceCardConfig } from "@/types";
import * as ImagePicker from "expo-image-picker";
import { uploadImage, uploadAudio } from "@/firebase/storage";
import { ThemedPicker } from "@/components/themed-picker";
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  RecordingPresets,
} from "expo-audio";

export default function MultipleChoiceCardForm({
  onChange,
  setIsReadyToSubmit,
  initialData,
}: {
  onChange: (data: Partial<MultipleChoiceCardConfig>) => void;
  setIsReadyToSubmit: (isReady: boolean) => void;
  initialData?: Partial<MultipleChoiceCardConfig>;
}) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [answer, setAnswer] = useState(initialData?.answer || "");
  const [options, setOptions] = useState<string[]>(initialData?.options || ["", ""]);
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image_url || null);
  const [voiceFileUrl, setVoiceFileUrl] = useState<string | null>(initialData?.voice_file_url || null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map(opt => opt.trim());
    const trimmedAnswer = answer.trim();

    onChange({
      question: trimmedQuestion,
      answer: trimmedAnswer,
      options: trimmedOptions,
      image_url: imageUrl,
      voice_file_url: voiceFileUrl,
      type: "multiple-choice",
    });

    setIsReadyToSubmit(
      !!trimmedQuestion &&
      !!trimmedAnswer &&
      trimmedOptions.length > 1 &&
      trimmedOptions.every((opt) => !!opt) &&
      trimmedOptions.includes(trimmedAnswer)
    );
  }, [question, answer, options, imageUrl, voiceFileUrl, onChange, setIsReadyToSubmit]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options[index] === answer) {
        setAnswer("");
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newОptions);
  };

  const handleOptionChange = (text: string, index: number) => {
    if (options[index] === answer) {
        setAnswer(text);
    }
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const uploadUrl = await uploadImage(result.assets[0].uri);
        setImageUrl(uploadUrl);
      } catch (error) {
        console.error("Failed to upload image:", error);
        Alert.alert("Error", "Failed to upload image.");
      } finally {
        setUploading(false);
      }
    }
  };
  
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
    setUploading(true);
    try {
      const downloadURL = await uploadAudio(uri);
      setVoiceFileUrl(downloadURL);
    } catch (error) {
      console.error("Error uploading audio: ", error);
      Alert.alert("Error", "Failed to upload audio.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <ThemedView>
      <ThemedTextInput
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
      />
      <ThemedText>Options:</ThemedText>
      {options.map((option, index) => (
        <View key={index} style={styles.optionContainer}>
          <ThemedTextInput
            placeholder={`Option ${index + 1}`}
            value={option}
            onChangeText={(text) => handleOptionChange(text, index)}
            style={styles.optionInput}
          />
          <Button title="Remove" onPress={() => handleRemoveOption(index)} />
        </View>
      ))}
      <Button title="Add Option" onPress={handleAddOption} />
      
      <ThemedText style={{ marginTop: 20 }}>Correct Answer:</ThemedText>
      <ThemedPicker
        onValueChange={(value) => setAnswer(value)}
        items={options
          .filter((opt) => opt)
          .map((opt) => ({ label: opt, value: opt }))
        }
        value={answer}
        placeholder={{ label: "Select the correct answer", value: null }}
      />

      <View style={styles.mediaContainer}>
        <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={styles.recordButton}
        >
            <ThemedText>
            {isRecording ? "Stop Recording" : "Start Recording"}
            </ThemedText>
        </TouchableOpacity>
        {voiceFileUrl && <ThemedText>Voice recorded.</ThemedText>}
        {uploading && <ThemedText>Uploading...</ThemedText>}
      </View>

      <View style={styles.mediaContainer}>
        <Button title="Pick an image from camera roll" onPress={pickImage} />
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    optionInput: {
        flex: 1,
        marginRight: 10,
    },
    mediaContainer: {
        marginTop: 20,
    },
    recordButton: {
        backgroundColor: "#007AFF",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        marginTop: 10,
    }
});
