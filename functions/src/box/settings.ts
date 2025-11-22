import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const onBoxUpdate = functions.firestore
  .document("boxes/{boxId}")
  .onUpdate(async (change, context) => {
    const boxId = context.params.boxId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (!beforeData || !afterData) {
      return null;
    }

    if (beforeData.dailyNewCardLimit === afterData.dailyNewCardLimit) {
      return null;
    }

    const dailyNewCardLimit = afterData.dailyNewCardLimit;

    if (dailyNewCardLimit <= 0) {
      return null;
    }

    const cardsRef = db.collection("cards");
    const query = cardsRef
      .where("boxId", "==", boxId)
      .where("level", "==", 0)
      .orderBy("nextReviewTime", "desc");

    const snapshot = await query.get();
    const cards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const batch = db.batch();
    let dayOffset = 0;

    for (let i = 0; i < cards.length; i++) {
      if (i % dailyNewCardLimit === 0 && i > 0) {
        dayOffset++;
      }

      const card = cards[i];
      const newReviewTime = new Date();
      newReviewTime.setHours(0, 0, 1, 0);
      newReviewTime.setDate(newReviewTime.getDate() + dayOffset);

      const cardRef = db.collection("cards").doc(card.id);
      batch.update(cardRef, { nextReviewTime: newReviewTime });
    }

    return batch.commit();
  });
