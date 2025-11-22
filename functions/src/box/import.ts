import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as os from "os";
import * as fs from "fs-extra";
import * as path from "path";
import Busboy from "busboy";
import * as unzipper from "unzipper";
import { FileInfo } from "busboy";

const db = admin.firestore();
const storage = admin.storage();

const handleFileUpload = async (
  localFilePath: string,
  userId: string,
): Promise<string> => {
  if (await fs.pathExists(localFilePath)) {
    const uniqueFileName = `${Date.now()}-${path.basename(localFilePath)}`;
    const destination = `audio/${userId}/${uniqueFileName}`;

    const [file] = await storage.bucket().upload(localFilePath, {
      destination: destination,
    });
    const [downloadUrl] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    return downloadUrl;
  } else {
    console.error(`File not found: ${localFilePath}`);
    return "";
  }
};

const processCardConfig = async (
  config: any,
  extractDir: string,
  userId: string,
): Promise<any> => {
  const newConfig = { ...config };
  for (const key in newConfig) {
    if (Object.prototype.hasOwnProperty.call(newConfig, key)) {
      const value = newConfig[key];
      if (typeof value === "string" && value.trim().startsWith("@data/")) {
        const fileName = value.trim().substring("@data/".length);
        const localFilePath = path.join(extractDir, "data", fileName);
        newConfig[key] = await handleFileUpload(localFilePath, userId);
      }
    }
  }
  return newConfig;
};

export const importBox = functions.https.onRequest((req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const busboy = Busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();
  const uploads: { [key: string]: string } = {};
  const fields: { [key: string]: string } = {};

  busboy.on("field", (fieldname: string, val: string) => {
    fields[fieldname] = val;
  });

  busboy.on(
    "file",
    (fieldname: string, file: NodeJS.ReadableStream, info: FileInfo) => {
      const { filename } = info;
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;
      file.pipe(fs.createWriteStream(filepath));
    },
  );

  busboy.on("finish", async () => {
    try {
      const userId = fields.userId;
      if (!userId) {
        res.status(401).send("User not authenticated");
        return;
      }
      const boxName = fields.boxName;
      if (!boxName) {
        res.status(400).send("boxName is required");
        return;
      }

      const zipPath = uploads.file;
      const extractDir = path.join(tmpdir, `import-${Date.now()}`);
      await fs.ensureDir(extractDir);

      await fs
        .createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractDir }))
        .promise();

      const files = await fs.readdir(extractDir);
      const contentDir =
        files.length === 1 &&
        (await fs.stat(path.join(extractDir, files[0]))).isDirectory()
          ? path.join(extractDir, files[0])
          : extractDir;

      const jsonPath = path.join(contentDir, "cards.json");
      if (!(await fs.pathExists(jsonPath))) {
        throw new Error("cards.json not found in the zip file.");
      }
      const importData = await fs.readJson(jsonPath);

      const newBox = await db.collection("boxes").add({
        name: boxName,
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      for (const cardData of importData.cards) {
        const processedConfig = await processCardConfig(
          cardData.config,
          contentDir,
          userId,
        );

        const newCard = {
          ...cardData,
          config: processedConfig,
          boxId: newBox.id,
          userId,
          level: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          nextReviewTime: new Date(),
        };
        delete newCard.id;

        await db.collection("cards").add(newCard);
      }

      res.status(200).send({ success: true, boxId: newBox.id });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    } finally {
      for (const file of Object.values(uploads)) {
        fs.remove(file);
      }
    }
  });

  busboy.end(req.rawBody);
});
