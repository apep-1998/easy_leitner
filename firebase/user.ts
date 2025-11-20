import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

const USERS_COLLECTION = "users";

export const updateUserToken = async (token: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(userDocRef, { aiToken: token }, { merge: true });
};

export const getUserToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return data.aiToken || "";
  } else {
    return "";
  }
};

export const updateUserProfilePicture = async (photoURL: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(userDocRef, { photoURL }, { merge: true });
};

export const getUserData = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const userDocRef = doc(db, USERS_COLLECTION, user.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};
