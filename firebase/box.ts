import {
  collection,
  onSnapshot,
  query,
  addDoc,
  deleteDoc,
  doc,
  where,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { Box } from "@/types";

const BOXES_COLLECTION = "boxes";
const CARDS_COLLECTION = "cards";

export const onBoxesSnapshot = (callback: (boxes: Box[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, BOXES_COLLECTION),
    where("userId", "==", user.uid)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const boxes: Box[] = [];
    querySnapshot.forEach((doc) => {
      boxes.push({ ...doc.data(), id: doc.id } as Box);
    });
    callback(boxes);
  });

  return unsubscribe;
};

export const addBox = async (boxName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  return await addDoc(collection(db, BOXES_COLLECTION), {
    name: boxName,
    userId: user.uid,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const deleteBox = async (boxId: string) => {
  return await deleteDoc(doc(db, BOXES_COLLECTION, boxId));
};

export const onCardsSnapshotInBox = (
  boxId: string,
  callback: (cards: any[]) => void
) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, CARDS_COLLECTION),
    where("userId", "==", user.uid),
    where("boxId", "==", boxId)
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const cards = querySnapshot.docs.map((doc) => doc.data());
    callback(cards);
  });

  return unsubscribe;
};
