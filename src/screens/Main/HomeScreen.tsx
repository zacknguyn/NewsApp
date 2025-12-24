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
  ScrollView,
} from "react-native";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Article, RootStackParamList } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getRecommendations } from "../../services/aiService";

export default function HomeScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "thời sự", name: "Thời sự" },
    { id: "bất động sản", name: "Bất động sản" },
    { id: "kinh doanh", name: "Kinh doanh" },
    { id: "xã hội", name: "Xã hội" },
    { id: "thế giới", name: "Thế giới" },
    { id: "thể thao", name: "Thể thao" },
    { id: "pháp luật", name: "Pháp luật" },
    { id: "lao động & đời sống", name: "Lao động & Đời sống" },
    { id: "giáo dục", name: "Giáo dục" },
  ];

  // Reload articles when screen is focused (e.g., after adding from Admin)
  useFocusEffect(
    React.useCallback(() => {
      loadArticles();
    }, [selectedCategory])
  );

  useEffect(() => {
    loadArticles();
    loadRecommendations();
  }, [selectedCategory]);

  const loadRecommendations = async () => {
    try {
      console.log("Loading recommendations for:", selectedCategory);
      const recommendationQuery =
        selectedCategory === "all" ? "tin tức tổng hợp" : selectedCategory;

      const recommendations = await getRecommendations(recommendationQuery, 5);
      console.log("Recommendations received:", recommendations);

      if (recommendations && recommendations.length > 0) {
        // Check if the AI returned full objects (external articles) or just IDs
        const isFullObject =
          typeof recommendations[0] === "object" && recommendations[0] !== null;

        if (isFullObject) {
          // Map external articles to our Article format
          const mappedArticles: Article[] = recommendations.map(
            (item: any, index: number) => {
              // Extract tags - handle both array and string formats
              let tags: string[] = [];

              // Try different field names for tags
              const tagSource = item.tags || item.keywords || item.categories;

              if (Array.isArray(tagSource)) {
                tags = tagSource;
              } else if (typeof tagSource === 'string') {
                // If it's a comma-separated string, split it
                tags = tagSource.includes(',')
                  ? tagSource.split(',').map((t: string) => t.trim())
                  : [tagSource];
              }

              // If no tags found, use category as fallback
              if (tags.length === 0 && item.category) {
                tags = [item.category];
              }

              // Last resort fallback
              if (tags.length === 0) {
                tags = ["Tin tức"];
              }

              // Debug: Log raw API response for this item
              console.log("🔍 API Item Debug:", {
                title: item.title?.substring(0, 30) + "...",
                category: item.category,
                categories: item.categories,
                tags: item.tags,
                image: item.image || item.imageUrl || item.image_url
              });

              return {
                id: item.url || `ext-${index}-${Date.now()}`,
                title: item.title || "Tin tức đề xuất",
                // Try multiple possible field names for subtitle/description
                subtitle: item.subtitle || item.description || item.summary || "",
                // Use content from API if available, otherwise create a template
                content: item.content || `<p>${item.summary || item.description || ""}</p><br/><p>Xem chi tiết tại: <a href="${item.url}">${item.url}</a></p>`,
                // Handle both category (string) and categories (array)
                category: item.category ||
                  (Array.isArray(item.categories) && item.categories.length > 0 ? item.categories[0] : null) ||
                  (typeof item.categories === 'string' ? item.categories : null) ||
                  "Đề xuất",
                // Try multiple possible field names for image URL
                imageUrl: item.imageUrl || item.image_url || item.image || item.thumbnail ||
                  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
                author: item.author || "Tin tổng hợp",
                publishedAt: item.publishedAt || item.published_at || new Date().toISOString(),
                readTime: item.readTime || item.read_time || 3,
                tags: tags,
                views: item.views || 0,
              };
            }
          );

          console.log("Mapped articles:", mappedArticles);
          setRecommendedArticles(mappedArticles);
        } else {
          // Assume these are Firestore IDs
          const articlesPromises = (recommendations as string[]).map((id) =>
            getDoc(doc(db, "articles", id))
          );
          const articlesDocs = await Promise.all(articlesPromises);
          const articlesData = articlesDocs
            .filter((docSnap) => docSnap.exists())
            .map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as Article[];

          setRecommendedArticles(articlesData);
        }
      } else if (articles.length > 0) {
        setRecommendedArticles(articles.slice(0, 5));
      }
    } catch (error) {
      console.log("Error loading recommendations:", error);
      if (articles.length > 0) {
        setRecommendedArticles(articles.slice(0, 5));
      }
    }
  };

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
    if (diffHours < 24) return `${diffHours} giờ`;
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days} ngày`;
    return date.toLocaleDateString("vi-VN");
  };

  const renderRecommendedItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.recommendedCard}
      onPress={() => navigation.navigate("ArticleDetail", { article: item })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.recommendedImage} />
      <View style={styles.recommendedContent}>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.recommendedTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Recommended Section (AI) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
            {recommendedArticles.length > 0 && (
              <Ionicons name="sparkles" size={16} color="#000" />
            )}
          </View>

          {recommendedArticles.length > 0 ? (
            <FlatList
              data={recommendedArticles}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recommendedList}
              renderItem={renderRecommendedItem}
              keyExtractor={(item) => `rec-${item.id}`}
            />
          ) : (
            <View style={styles.emptyRecommended}>
              <Text style={styles.emptyText}>Chưa có gợi ý phù hợp</Text>
            </View>
          )}

          {/* Latest News Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tin mới nhất</Text>
          </View>

          <View style={styles.list}>
            {articles.map((item) => (
              <View key={item.id}>{renderArticle({ item })}</View>
            ))}
          </View>
        </ScrollView>
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
    zIndex: 10,
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
    zIndex: 10,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
  },
  recommendedList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recommendedCard: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendedImage: {
    width: "100%",
    height: 160,
  },
  recommendedContent: {
    padding: 12,
  },
  recommendedTitle: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    lineHeight: 22,
  },
  emptyRecommended: {
    marginHorizontal: 16,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    fontSize: 14,
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
