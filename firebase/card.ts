import {
  collection,
  onSnapshot,
  updateDoc,
  query,
  addDoc,
  doc,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { Card, CardConfig } from "@/types";

const CARDS_COLLECTION = "cards";

export const addCard = async (
  boxId: string,
  cardType: "standard" | "spelling",
  cardData: Partial<CardConfig>,
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  return await addDoc(collection(db, CARDS_COLLECTION), {
    config: {
      type: cardType,
      ...cardData,
    },
    boxId: boxId,
    userId: user.uid,
    finished: false,
    level: 0,
    nextReviewTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

export const onReadyCardsSnapshot = (
  boxId: string,
  callback: (cards: Card[]) => void,
) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, CARDS_COLLECTION),
    where("userId", "==", user.uid),
    where("boxId", "==", boxId),
    where("nextReviewTime", "<=", new Date()),
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const cards: Card[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      cards.push({
        ...data,
        id: doc.id,
        // Convert Firestore Timestamps to JS Dates
        nextReviewTime: (data.nextReviewTime as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate(),
        updatedAt: (data.updatedAt as Timestamp).toDate(),
      } as Card);
    });
    callback(cards);
  });

  return unsubscribe;
};

export const setCardNextLevel = async (
  cardId: string,
  level: number,
  nextReviewTime: Date,
  finished: boolean,
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  await updateDoc(doc(db, CARDS_COLLECTION, cardId), {
    level: level,
    finished: finished,
    nextReviewTime: nextReviewTime,
    updatedAt: new Date(),
  });
};
