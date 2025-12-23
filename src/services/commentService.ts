// src/services/commentService.ts
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { Comment } from "../types";

/**
 * Add a new comment to an article
 */
export const addComment = async (
    articleId: string,
    userId: string,
    userName: string,
    content: string,
    userAvatar?: string
): Promise<string> => {
    try {
        console.log("Adding comment with data:", { articleId, userId, userName, content });

        const commentData = {
            articleId,
            userId,
            userName,
            userAvatar: userAvatar || "",
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
        };

        const docRef = await addDoc(collection(db, "comments"), commentData);
        console.log("Comment added successfully with ID:", docRef.id);
        return docRef.id;
    } catch (error: any) {
        console.error("Error adding comment:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        throw error;
    }
};

/**
 * Get all comments for an article
 */
export const getComments = async (articleId: string): Promise<Comment[]> => {
    try {
        const q = query(
            collection(db, "comments"),
            where("articleId", "==", articleId)
        );

        const snapshot = await getDocs(q);
        const comments = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Comment[];

        // Sort in memory instead of using orderBy
        return comments.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    } catch (error) {
        console.error("Error getting comments:", error);
        throw error;
    }
};

/**
 * Delete a comment (admin or comment owner only)
 */
export const deleteComment = async (commentId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, "comments", commentId));
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
};

/**
 * Subscribe to real-time comment updates for an article
 */
export const subscribeToComments = (
    articleId: string,
    callback: (comments: Comment[]) => void
): (() => void) => {
    const q = query(
        collection(db, "comments"),
        where("articleId", "==", articleId)
    );

    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            const comments = snapshot.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .sort((a: any, b: any) => {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }) as Comment[];
            callback(comments);
        },
        (error) => {
            console.error("Error subscribing to comments:", error);
        }
    );

    return unsubscribe;
};
