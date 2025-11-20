import { TouchableHighlight, Alert } from "react-native";
import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedTextInput } from "@/components/themed-text-input";
import { Link } from "expo-router";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onRegisterClick = () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
      })
      .catch((error) => {
        const errorMessage = error.message;
        Alert.alert("Error", errorMessage);
      });
  };

  return (
    <SafeScrollView
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <ThemedView
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 24,
          flex: 1,
        }}
      >
        <ThemedText type="title" style={{ marginBottom: 24 }}>
          Register
        </ThemedText>

        <ThemedTextInput
          placeholder="Email"
          style={{
            width: "80%",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 12,
            paddingLeft: 8,
          }}
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <ThemedTextInput
          placeholder="Username"
          style={{
            width: "80%",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 12,
            paddingLeft: 8,
          }}
          onChangeText={setUsername}
          value={username}
          autoCapitalize="none"
        />
        <ThemedTextInput
          placeholder="Password"
          secureTextEntry
          style={{
            width: "80%",
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            marginBottom: 12,
            paddingLeft: 8,
          }}
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
        />
        <TouchableHighlight
          style={{
            backgroundColor: "#007AFF",
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 8,
            width: "60%",
            alignSelf: "center",
            marginTop: 16,
          }}
          onPress={onRegisterClick}
        >
          <ThemedText
            type="default"
            style={{ color: "white", textAlign: "center" }}
          >
            Register
          </ThemedText>
        </TouchableHighlight>
        {/* or regester */}
        <Link href="/login" style={{ marginTop: 16 }}>
          <ThemedText
            type="default"
            style={{ color: "#007AFF", textAlign: "center" }}
          >
            Login
          </ThemedText>
        </Link>
      </ThemedView>
    </SafeScrollView>
  );
}
