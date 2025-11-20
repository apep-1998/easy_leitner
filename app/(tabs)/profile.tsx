import { useEffect, useState } from "react";
import { StyleSheet, TouchableHighlight, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

import SafeScrollView from "@/components/safe-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import SettingsModal from "@/components/settings-modal";
import { getUserData, updateUserProfilePicture } from "@/firebase/user";
import { uploadProfilePicture } from "@/firebase/storage";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userData = await getUserData();
        if (userData && userData.photoURL) {
          setProfilePicture(userData.photoURL);
        }
      } else {
        setUser(null);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const onLogoutPress = () => {
    signOut(auth).catch((error) => {
      // An error happened.
    });
  };

  const onProfilePicturePress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      try {
        const uploadURL = await uploadProfilePicture(uri);
        await updateUserProfilePicture(uploadURL);
        setProfilePicture(uploadURL);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Error uploading profile picture.");
      }
    }
  };
  return (
    <SafeScrollView>
      <SettingsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <ThemedView style={styles.titleContainer}>
        <TouchableHighlight
          onPress={onProfilePicturePress}
          style={styles.profilePictureContainer}
        >
          <Image
            style={styles.profilePicture}
            source={
              profilePicture
                ? { uri: profilePicture }
                : require("@/assets/images/user.png")
            }
          />
        </TouchableHighlight>
        <ThemedText type="default">{user ? user.email : "Guest"}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableHighlight
          onPress={() => setModalVisible(true)}
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
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                minHeight: 48,
              }}
            >
              <MaterialIcons name="settings" size={24} color="white" />
              <ThemedText style={{ marginLeft: 10 }}>Settings</ThemedText>
            </ThemedView>
            <ThemedView>
              <Entypo name="chevron-right" size={24} color="white" />
            </ThemedView>
          </ThemedView>
        </TouchableHighlight>
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
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                minHeight: 48,
              }}
            >
              <MaterialIcons name="logout" size={24} color="white" />
              <ThemedText style={{ marginLeft: 10 }}>Logout</ThemedText>
            </ThemedView>
            <ThemedView>
              <Entypo name="chevron-right" size={24} color="white" />
            </ThemedView>
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
  },
  profilePictureContainer: {
    borderRadius: 50,
    marginBottom: 16,
  },
  profilePicture: {
    backgroundColor: "#ccc",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  stepContainer: {
    paddingTop: 32,
    paddingLeft: 24,
    paddingRight: 24,
    flex: 4,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
