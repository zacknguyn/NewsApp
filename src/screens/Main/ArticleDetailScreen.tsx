// src/screens/Main/ArticleDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Dimensions,
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

const { width } = Dimensions.get("window");

export default function ArticleDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { article } = route.params;
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  React.useEffect(() => {
    checkIfSaved();
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
              <Text style={styles.summaryText}>{article.aiSummary}</Text>
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
          {article.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
});
