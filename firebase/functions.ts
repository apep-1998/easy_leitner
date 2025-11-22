import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();

export const exportBox = httpsCallable(functions, "exportBox");

export const importBox = async (fileUri: string, boxName: string, userId: string) => {
    const url = `https://us-central1-${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.cloudfunctions.net/importBox`;
    const formData = new FormData();
    formData.append("file", {
        uri: fileUri,
        name: "box.zip",
        type: "application/zip",
    } as any);
    formData.append("boxName", boxName);
    formData.append("userId", userId);
    
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    
    return response.json();
    }
    
