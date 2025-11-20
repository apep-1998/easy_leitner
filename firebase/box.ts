import {
  collection,
  onSnapshot,
  query,
  addDoc,
  deleteDoc,
  doc,
  where,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { Box } from "@/types";

const BOXES_COLLECTION = "boxes";
const CARDS_COLLECTION = "cards";

export const getBox = async (boxId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, BOXES_COLLECTION, boxId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as Box;
  } else {
    throw new Error("No such document!");
  }
};

export const onBoxesSnapshot = (callback: (boxes: Box[]) => void) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, BOXES_COLLECTION),
    where("userId", "==", user.uid),
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
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const cardsQuery = query(
    collection(db, CARDS_COLLECTION),
    where("userId", "==", user.uid),
    where("boxId", "==", boxId),
  );
  const cardsSnapshot = await getDocs(cardsQuery);

  const batch = writeBatch(db);
  cardsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  const boxRef = doc(db, BOXES_COLLECTION, boxId);
  batch.delete(boxRef);

  await batch.commit();
};

export const onCardsSnapshotInBox = (
  boxId: string,
  callback: (cards: any[]) => void,
) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, CARDS_COLLECTION),
    where("userId", "==", user.uid),
    where("boxId", "==", boxId),
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const cards = querySnapshot.docs.map((doc) => {
      const card = doc.data();
      card.id = doc.id;
      return card;
    });
    callback(cards);
  });

  return unsubscribe;
};
