import { CVProfile } from "../types";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, orderBy } from "firebase/firestore";

const COLLECTION_NAME = "cvs";

export const saveCV = async (cv: CVProfile, userId: string): Promise<void> => {
  if (!userId) throw new Error("User must be authenticated to save.");
  
  try {
    const cvWithUser = { ...cv, userId };
    // We add a new document to the 'cvs' collection
    await addDoc(collection(db, COLLECTION_NAME), cvWithUser);
  } catch (error) {
    console.error("Error saving CV to Firestore:", error);
    throw error;
  }
};

export const getSavedCVs = async (userId: string): Promise<CVProfile[]> => {
  if (!userId) return [];
  
  try {
    const q = query(
        collection(db, COLLECTION_NAME), 
        where("userId", "==", userId)
        // Note: orderBy requires an index in Firestore. If it fails, remove orderBy or create index.
        // For simplicity in this demo, we'll sort in JS.
    );
    
    const querySnapshot = await getDocs(q);
    const cvs = querySnapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id // Use Firestore ID
    } as CVProfile));
    
    // Client-side sort to avoid index requirements immediately
    return cvs.sort((a, b) => b.generatedAt - a.generatedAt);
  } catch (error) {
    console.error("Error fetching CVs from Firestore:", error);
    return [];
  }
};

export const deleteCV = async (cvId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, cvId));
    } catch (error) {
        console.error("Error deleting CV", error);
        throw error;
    }
}