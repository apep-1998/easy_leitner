import { useEffect, useState } from "react";
import { StyleSheet, TouchableHighlight, Image } from "react-native";

import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebaseConfig";
import { signOut } from "firebase/auth";
export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setUser(JSON.parse(user));
      }
    };
    fetchUser();
  }, []);
  const onLogoutPress = () => {
    signOut(auth)
      .then(async () => {
        // Sign-out successful.
        await AsyncStorage.removeItem("user");
        router.replace("/login");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <SafeScrollView>
      <ThemedView style={styles.titleContainer}>
        <Image
          style={styles.profilePicture}
          source={require("@/assets/images/user.png")}
        />
        <ThemedText type="default">{user ? user.email : "Guest"}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableHighlight
          onPress={onLogoutPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            borderRadius: 8,
          }}
        >
          <ThemedView
            style={{
              alignItems: "center",
              minHeight: 48,
              flexDirection: "row",
            }}
          >
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                minHeight: 48,
              }}
            >
              <MaterialIcons name="logout" size={24} color="white" />
              <ThemedText style={{ marginLeft: 10 }}>Logout</ThemedText>
            </ThemedView>
            <Entypo name="chevron-right" size={24} color="white" />
          </ThemedView>
        </TouchableHighlight>
      </ThemedView>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 10,
    flex: 1,
  },
  profilePicture: {
    backgroundColor: "#CCCCCC",
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  stepContainer: {
    paddingTop: 32,
    paddingLeft: 24,
    paddingRight: 24,
    flex: 4,
    alignItems: "center",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
