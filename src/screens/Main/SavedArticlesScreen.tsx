// src/screens/Main/SavedArticlesScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { Article, RootStackParamList } from "../../types";

export default function SavedArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      loadSavedArticles();
    }, [user])
  );

  const loadSavedArticles = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, "users", user.id));
      const savedArticleIds = userDoc.data()?.savedArticles || [];

      if (savedArticleIds.length > 0) {
        const articlesPromises = savedArticleIds.map((id: string) =>
          getDoc(doc(db, "articles", id))
        );
        const articlesDocs = await Promise.all(articlesPromises);
        const articlesData = articlesDocs
          .filter((doc) => doc.exists())
          .map((doc) => ({ id: doc.id, ...doc.data() })) as Article[];
        setArticles(articlesData);
      }
    } catch (error) {
      console.error("Error loading saved articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffHours < 1) return "Vừa xong";
    if (diffHours < 24) return `${diffHours} giờ`;
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString("vi-VN");
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => navigation.navigate("ArticleDetail", { article: item })}
    >
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.author}>{item.author}</Text>
          <View style={styles.stats}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.statText}>{item.readTime} phút</Text>
            <Ionicons
              name="eye-outline"
              size={14}
              color="#666"
              style={{ marginLeft: 8 }}
            />
            <Text style={styles.statText}>{item.views}</Text>
          </View>
        </View>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.image} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đã lưu</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>
            Vui lòng đăng nhập để xem bài viết đã lưu
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bookmark" size={24} color="#000" />
        <Text style={styles.headerTitle}>Đã lưu</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Chưa có bài viết đã lưu</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    textAlign: "center",
  },
  list: {
    padding: 16,
  },
  articleCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    padding: 16,
  },
  articleContent: {
    flex: 1,
    marginRight: 16,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    letterSpacing: 0.5,
  },
  dot: {
    marginHorizontal: 6,
    color: "#9ca3af",
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  title: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#000",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    marginLeft: 4,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
});
