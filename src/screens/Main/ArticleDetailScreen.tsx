// src/screens/Main/ArticleDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import RenderHtml from "react-native-render-html";
import { Comment } from "../../types";
import {
  addComment,
  subscribeToComments,
  deleteComment,
} from "../../services/commentService";
import { generateAISummary } from "../../services/aiService";

const { width } = Dimensions.get("window");

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { article } = route.params;
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [aiSummary, setAiSummary] = useState(article.aiSummary || "");
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    checkIfSaved();

    // Subscribe to real-time comments
    const unsubscribe = subscribeToComments(article.id, (newComments) => {
      setComments(newComments);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, []);

  const checkIfSaved = async () => {
    if (!user) return;
    const userDoc = await getDoc(doc(db, "users", user.id));
    const savedArticles = userDoc.data()?.savedArticles || [];
    setIsSaved(savedArticles.includes(article.id));
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để lưu bài viết");
      return;
    }

    const userRef = doc(db, "users", user.id);
    if (isSaved) {
      await updateDoc(userRef, {
        savedArticles: arrayRemove(article.id),
      });
      setIsSaved(false);
    } else {
      await updateDoc(userRef, {
        savedArticles: arrayUnion(article.id),
      });
      setIsSaved(true);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.subtitle}`,
        title: article.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handlePostComment = async () => {
    if (!user) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!commentText.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setSubmittingComment(true);
      await addComment(
        article.id,
        user.id,
        user.name,
        commentText.trim(),
        user.avatar
      );
      setCommentText("");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = (comment: Comment) => {
    if (user?.id !== comment.userId && user?.role !== "admin") {
      return;
    }

    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa bình luận này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(comment.id);
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa bình luận");
            }
          },
        },
      ]
    );
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Ionicons name="person-circle" size={40} color="#9ca3af" />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.userName}</Text>
          <Text style={styles.commentDate}>{formatCommentDate(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
        {(user?.id === item.userId || user?.role === "admin") && (
          <TouchableOpacity
            style={styles.deleteCommentButton}
            onPress={() => handleDeleteComment(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
            <Text style={styles.deleteCommentText}>Xóa</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleGenerateAISummary = async () => {
    try {
      setGeneratingAI(true);
      const summary = await generateAISummary(article.content);
      setAiSummary(summary);

      // Optionally save to Firebase
      // await updateArticle(article.id, { aiSummary: summary });
    } catch (error: any) {
      Alert.alert(
        "Lỗi tạo tóm tắt",
        error.message || "Không thể tạo tóm tắt AI. Vui lòng thử lại."
      );
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={24}
              color="#000"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {article.category.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.subtitle}>{article.subtitle}</Text>

        <View style={styles.meta}>
          <Text style={styles.author}>{article.author}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.date}>{formatDate(article.publishedAt)}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{article.readTime}m</Text>
          </View>
          <Text style={styles.metaDivider}>•</Text>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{article.views}</Text>
          </View>
        </View>

        <Image source={{ uri: article.imageUrl }} style={styles.image} />

        <View style={styles.summaryContainer}>
          <TouchableOpacity
            style={styles.summaryHeader}
            onPress={() => setShowSummary(!showSummary)}
          >
            <View style={styles.summaryTitle}>
              <View style={styles.summaryIcon}>
                <Ionicons name="sparkles" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.summaryTitleText}>Tóm tắt AI</Text>
                <Text style={styles.summarySubtitle}>
                  {showSummary ? "Ẩn tóm tắt" : "Hiển thị tóm tắt"}
                </Text>
              </View>
            </View>
            <Ionicons
              name={showSummary ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>

          {showSummary && (
            <View style={styles.summaryContent}>
              {aiSummary ? (
                <Text style={styles.summaryText}>{aiSummary}</Text>
              ) : (
                <View style={styles.noSummary}>
                  <Ionicons name="document-text-outline" size={32} color="#9ca3af" />
                  <Text style={styles.noSummaryText}>Chưa có tóm tắt AI</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateButton, generatingAI && styles.generateButtonDisabled]}
                onPress={handleGenerateAISummary}
                disabled={generatingAI}
              >
                {generatingAI ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.generateButtonText}>Đang tạo...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.generateButtonText}>
                      {aiSummary ? "Tạo lại tóm tắt" : "Tạo tóm tắt AI"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <RenderHtml
            contentWidth={width - 48}
            source={{ html: article.content }}
            tagsStyles={htmlStyles}
          />
        </View>

        <View style={styles.tags}>
          {article.tags.map((tag: string) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsSectionHeader}>
            <Ionicons name="chatbubbles" size={20} color="#000" />
            <Text style={styles.commentsSectionTitle}>
              Bình luận ({comments.length})
            </Text>
          </View>

          {loadingComments ? (
            <ActivityIndicator size="small" color="#000" style={{ marginVertical: 20 }} />
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyCommentsText}>Chưa có bình luận nào</Text>
              <Text style={styles.emptyCommentsSubtext}>Hãy là người đầu tiên bình luận!</Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
      >
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Viết bình luận..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || submittingComment) && styles.sendButtonDisabled,
            ]}
            onPress={handlePostComment}
            disabled={!commentText.trim() || submittingComment}
          >
            {submittingComment ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const htmlStyles = {
  p: {
    fontSize: 16,
    lineHeight: 26,
    color: "#374151",
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  h1: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    marginTop: 24,
    marginBottom: 16,
  },
  h2: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    marginTop: 20,
    marginBottom: 12,
  },
  h3: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 10,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 24,
    marginHorizontal: 24,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    lineHeight: 36,
    marginTop: 16,
    marginHorizontal: 24,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    color: "#000",
    lineHeight: 28,
    marginTop: 12,
    marginHorizontal: 24,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  author: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#000",
  },
  metaDivider: {
    marginHorizontal: 8,
    color: "#9ca3af",
  },
  date: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  image: {
    width: "100%",
    height: 240,
    resizeMode: "cover",
  },
  summaryContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  summaryTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryTitleText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  summarySubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  summaryContent: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 22,
  },
  noSummary: {
    alignItems: "center",
    paddingVertical: 24,
  },
  noSummaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    marginTop: 8,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  generateButtonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  content: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#000",
  },
  commentsSection: {
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 80,
  },
  commentsSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  emptyComments: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#6b7280",
    marginTop: 12,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    marginTop: 4,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  commentDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
  },
  commentText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 20,
  },
  deleteCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  deleteCommentText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#dc2626",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 12,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
});
