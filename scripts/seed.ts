#!/usr/bin/env node

import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { CardConfigSchema, BoxSchema } from "../types";

dotenv.config();

// --- IMPORTANT SETUP ---
// 1. Create a service account for your Firebase project:
//    - Go to Project Settings > Service accounts in the Firebase console.
//    - Click "Generate new private key" and save the JSON file.
// 2. Create a '.env' file in the root of this project.
// 3. Add the following lines to your '.env' file:
//    GOOGLE_APPLICATION_CREDENTIALS=./path-to-your-service-account-key.json
//    FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "Error: GOOGLE_APPLICATION_CREDENTIALS is not set in your .env file.",
  );
  process.exit(1);
}

const serviceAccountPath = path.resolve(
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Error: Service account key not found at: ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const storage = admin.storage().bucket();

/**
 * Adds a new box to Firestore for a given user.
 * @param {string} userId - The ID of the user.
 * @param {string} boxName - The name of the new box.
 */
async function addNewBox(userId: string, boxName: string) {
  const boxData = BoxSchema.parse({
    userId,
    name: boxName,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const boxRef = db.collection("boxes").doc();
  await boxRef.set(boxData);
  console.log(`Successfully added box "${boxData.name}" with ID: ${boxRef.id}`);
  return boxRef.id;
}

/**
 * Adds a new card to a specified box for a user.
 * @param {string} userId - The ID of the user.
 * @param {string} boxId - The ID of the box to add the card to.
 * @param {object} config - The card configuration object.
 */
async function addNewCard(userId: string, boxId: string, config: any) {
  const validatedConfig = CardConfigSchema.parse(config);

  const cardRef = db.collection("cards").doc();
  await cardRef.set({
    userId,
    boxId,
    config: validatedConfig,
    level: 0,
    finished: false,
    nextReviewTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(
    `Successfully added a new "${validatedConfig.type}" card with ID: ${cardRef.id}`,
  );
  return cardRef.id;
}

/**
 * Uploads a file to Firebase Storage.
 * @param {string} fileAddress - The local path to the file.
 * @returns {Promise<string>} The public URL of the uploaded file.
 */
async function uploadFile(fileAddress: string) {
  z.string().min(1, "File address is required").parse(fileAddress);
  const filePath = path.resolve(fileAddress);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at: ${filePath}`);
  }

  const [uploadedFile] = await storage.upload(filePath);
  await uploadedFile.makePublic();

  const publicUrl = uploadedFile.publicUrl();
  console.log(`Successfully uploaded file. Public URL: ${publicUrl}`);
  return publicUrl;
}

// --- Script Execution ---
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "add-box":
        await addNewBox(args[1], args[2]);
        break;
      case "add-card":
        const config = JSON.parse(args[3]);
        await addNewCard(args[1], args[2], config);
        break;
      case "upload-file":
        await uploadFile(args[1]);
        break;
      default:
        console.log("Unknown command. Available commands:");
        console.log("  add-box <userId> <boxName>");
        console.log("  add-card <userId> <boxId> '<configJSON>'");
        console.log("  upload-file <filePath>");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation failed:", error.format());
    } else {
      console.error("Operation failed:", (error as Error).message);
    }
    process.exit(1);
  }
}

main();
