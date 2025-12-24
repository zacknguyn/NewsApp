// src/screens/Main/SearchScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Article, RootStackParamList } from "../../types";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
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

  const trendingSearches = [
    "AI",
    "Công nghệ",
    "Kinh tế",
    "Thể thao",
    "Sức khỏe",
  ];

  useEffect(() => {
    loadArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchQuery, selectedCategory, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "articles"));
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

  const filterArticles = () => {
    let filtered = articles;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.subtitle.toLowerCase().includes(query) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory
      );
    }

    setFilteredArticles(filtered);
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleItem}
      onPress={() => navigation.navigate("ArticleDetail", { article: item })}
    >
      <View style={styles.articleContent}>
        <Text style={styles.category}>{item.category.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#9ca3af"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin tức..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
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
      {!searchQuery && (
        <View style={styles.trending}>
          <View style={styles.trendingHeader}>
            <Ionicons name="trending-up" size={20} color="#000" />
            <Text style={styles.trendingTitle}>Xu hướng</Text>
          </View>
          <View style={styles.trendingTags}>
            {trendingSearches.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.trendingTag}
                onPress={() => setSearchQuery(term)}
              >
                <Text style={styles.trendingTagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {searchQuery && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredArticles.length} kết quả cho "{searchQuery}"
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchQuery ? (
              <View style={styles.empty}>
                <Ionicons name="search" size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
              </View>
            ) : null
          }
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
    borderBottomColor: "#e5e7eb",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#000",
  },
  categories: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoriesWrapper: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  trending: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  trendingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  trendingTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#000",
  },
  trendingTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trendingTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
  },
  trendingTagText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#374151",
  },
  resultsHeader: {
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  articleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  articleContent: {
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
  },
});
