import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/firebaseConfig";

export const uploadAudio = async (uri: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(
    storage,
    `audio/${user.uid}/${new Date().getTime()}.m4a`
  );

  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};

export const uploadProfilePicture = async (uri: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(
    storage,
    `profile-pictures/${user.uid}`
  );

  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
