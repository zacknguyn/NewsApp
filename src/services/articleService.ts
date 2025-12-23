// src/services/articleService.ts
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Article } from "../types";

/**
 * Create a new article in Firebase
 */
export const createArticle = async (
    article: Omit<Article, "id">
): Promise<string> => {
    try {
        const articleId = `article-${Date.now()}`;
        await setDoc(doc(db, "articles", articleId), {
            ...article,
            publishedAt: article.publishedAt || new Date().toISOString(),
            views: article.views || 0,
        });
        return articleId;
    } catch (error) {
        console.error("Error creating article:", error);
        throw error;
    }
};

/**
 * Update an existing article
 */
export const updateArticle = async (
    id: string,
    article: Partial<Article>
): Promise<void> => {
    try {
        const articleRef = doc(db, "articles", id);
        await updateDoc(articleRef, article);
    } catch (error) {
        console.error("Error updating article:", error);
        throw error;
    }
};

/**
 * Delete an article
 */
export const deleteArticle = async (id: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, "articles", id));
    } catch (error) {
        console.error("Error deleting article:", error);
        throw error;
    }
};

/**
 * Get all articles
 */
export const getAllArticles = async (): Promise<Article[]> => {
    try {
        const q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Article[];
    } catch (error) {
        console.error("Error getting articles:", error);
        throw error;
    }
};
