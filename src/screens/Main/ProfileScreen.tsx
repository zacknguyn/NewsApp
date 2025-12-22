// src/screens/Main/ProfileScreen.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.role === "admin" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>QUẢN TRỊ VIÊN</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={24} color="#000" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: "#ef4444" }]}>Đăng xuất</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// src/screens/Main/SavedArticlesScreen.tsx
export function SavedArticlesScreen() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const navigation = useNavigation();

  React.useEffect(() => {
    loadSavedArticles();
  }, []);

  const loadSavedArticles = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.id));
      const savedArticleIds = userDoc.data()?.savedArticles || [];

      if (savedArticleIds.length > 0) {
        const articlesPromises = savedArticleIds.map((id) =>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đã lưu</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Chưa có bài viết đã lưu</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.articleCard}
              onPress={() =>
                navigation.navigate("ArticleDetail", { article: item })
              }
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.articleContent}>
                <Text style={styles.category}>
                  {item.category.toUpperCase()}
                </Text>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
  headerTitle: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#000",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#000",
    marginLeft: 12,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
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
  },
  image: {
    width: 100,
    height: 100,
  },
  articleContent: {
    flex: 1,
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#6b7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
});
