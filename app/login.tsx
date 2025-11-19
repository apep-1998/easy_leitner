import { TouchableHighlight, Alert } from "react-native";
import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { ThemedTextInput } from "@/components/themed-text-input";
import { Link, useRouter } from "expo-router";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        router.replace("/(tabs)");
      }
    };
    checkUser();
  }, []);

  const onLoginPress = () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in
        const user = userCredential.user;
        await AsyncStorage.setItem("user", JSON.stringify(user));
        router.replace("/(tabs)");
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
          Login
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
          onPress={onLoginPress}
        >
          <ThemedText
            type="default"
            style={{ color: "white", textAlign: "center" }}
          >
            Login
          </ThemedText>
        </TouchableHighlight>
        {/* or regester */}
        <Link href="/register" style={{ marginTop: 16 }}>
          <ThemedText
            type="default"
            style={{ color: "#007AFF", textAlign: "center" }}
          >
            Register
          </ThemedText>
        </Link>
      </ThemedView>
    </SafeScrollView>
  );
}
