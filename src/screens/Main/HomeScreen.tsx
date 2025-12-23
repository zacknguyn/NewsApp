// src/screens/Main/HomeScreen.tsx
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
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Article } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigation = useNavigation();

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "technology", name: "Công nghệ" },
    { id: "business", name: "Kinh doanh" },
    { id: "sports", name: "Thể thao" },
    { id: "health", name: "Sức khỏe" },
  ];

  // Reload articles when screen is focused (e.g., after adding from Admin)
  useFocusEffect(
    React.useCallback(() => {
      loadArticles();
    }, [selectedCategory])
  );

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      let q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));

      if (selectedCategory !== "all") {
        q = query(q, where("category", "==", selectedCategory));
      }

      const snapshot = await getDocs(q);
      const articlesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Article[];

      setArticles(articlesData);
    } catch (error) {
      console.error("Error loading articles:", error);
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
    if (diffHours < 24) return `${diffHours}h`;
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days}d`;
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
            <Text style={styles.statText}>{item.readTime}m</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin Tức VN</Text>
      </View>
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.categoryTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    textAlign: "center",
  },
  categories: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  categoriesWrapper: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#fff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    flexDirection: "row",
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