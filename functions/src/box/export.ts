import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import archiver from "archiver";
import * as os from "os";
import * as fs from "fs-extra";
import * as path from "path";
import axios from "axios";

const db = admin.firestore();
const storage = admin.storage();

// Helper to download a file from a URL
const downloadFile = async (url: string, dest: string) => {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  (response.data as NodeJS.ReadableStream).pipe(writer);

  return new Promise<void>((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

type CardConfig =
  | {
      type: "standard";
      front: string;
      back: string;
    }
  | {
      type: "spelling";
      voice_file_url: string;
      spelling: string;
    }
  | {
      type: "word-standard";
      word: string;
      part_of_speech: string;
      pronunciation_file: string;
      back: string;
    }
  | {
      type: "german-verb-conjugator";
      verb: string;
      pronunciation_file_url: string | null;
      ich: string;
      du: string;
      "er/sie/es": string;
      wir: string;
      ihr: string;
      sie: string;
    };

interface CardData {
  id: string;
  config: CardConfig;
  boxId: string;
  userId: string;
}

export const exportBox = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError(
            "unauthenticated",
            "User not authenticated"
        );
    }
    const userId = request.auth.uid;
    const boxId = request.data.boxId;

    if (!boxId) {
        throw new HttpsError(
            "invalid-argument",
            "boxId is required"
        );
    }

    const tmpdir = os.tmpdir();
    const exportDir = path.join(tmpdir, `export-${boxId}-${Date.now()}`);
    const dataDir = path.join(exportDir, "data");
    await fs.ensureDir(dataDir);

    try {
        const boxDoc = await db.collection("boxes").doc(boxId).get();
        const box = boxDoc.data();

        if (!box || box.userId !== userId) {
            throw new HttpsError(
                "permission-denied",
                "User does not have access to this box"
            );
        }

        const cardsSnapshot = await db
            .collection("cards")
            .where("boxId", "==", boxId)
            .where("userId", "==", userId)
            .get();

        const cards = cardsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as CardData[];

        const processedCards = await Promise.all(
            cards.map(async (card) => {
                const newConfig = { ...card.config };
                const knownFileFields = [
                    "voice_file_url",
                    "pronunciation_file",
                    "pronunciation_file_url",
                ];

                for (const field of knownFileFields) {
                    const fileUrl = (newConfig as any)[field];
                    if (typeof fileUrl === "string" && fileUrl.startsWith("http")) {
                        try {
                            const url = new URL(fileUrl);
                            const fileName = path.basename(url.pathname) || `${Date.now()}`;
                            const localPath = path.join(dataDir, fileName);
                            await downloadFile(fileUrl, localPath);
                            (newConfig as any)[field] = `@data/${fileName}`;
                        } catch (error) {
                            console.error(`Failed to process file URL ${fileUrl}:`, error);
                        }
                    }
                }
                return { config: newConfig };
            })
        );

        const exportData = {
            version: "1.0",
            cards: processedCards,
        };

        const jsonPath = path.join(exportDir, "cards.json");
        await fs.writeJson(jsonPath, exportData, { spaces: 2 });

        const zipPath = path.join(tmpdir, `export-${boxId}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        const closePromise = new Promise<void>((resolve, reject) => {
            output.on('close', resolve);
            archive.on('error', reject);
        });

        archive.pipe(output);
        archive.directory(exportDir, false);
        await archive.finalize();
        await closePromise;

        const destination = `exports/${userId}/${boxId}-${Date.now()}.zip`;
        const [file] = await storage.bucket().upload(zipPath, {
            destination: destination,
            metadata: {
                contentType: "application/zip",
            },
        });

        const downloadUrl = await file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
        });

        return { downloadUrl: downloadUrl[0] };
    } finally {
        await fs.remove(exportDir);
    }
});
