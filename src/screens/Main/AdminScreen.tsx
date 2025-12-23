// src/screens/Main/AdminScreen.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Article } from "../../types";
import {
    getAllArticles,
    createArticle,
    updateArticle,
    deleteArticle,
} from "../../services/articleService";
import { useAuth } from "../../contexts/AuthContext";

type CategoryType = "technology" | "business" | "sports" | "health" | "science";

export default function AdminScreen() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    // Form state
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState<CategoryType>("technology");
    const [imageUrl, setImageUrl] = useState("");
    const [readTime, setReadTime] = useState("5");
    const [tags, setTags] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const categories: { id: CategoryType; name: string }[] = [
        { id: "technology", name: "Công nghệ" },
        { id: "business", name: "Kinh doanh" },
        { id: "sports", name: "Thể thao" },
        { id: "health", name: "Sức khỏe" },
        { id: "science", name: "Khoa học" },
    ];

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            setLoading(true);
            const data = await getAllArticles();
            setArticles(data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải danh sách bài viết");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle("");
        setSubtitle("");
        setContent("");
        setAuthor("");
        setCategory("technology");
        setImageUrl("");
        setReadTime("5");
        setTags("");
        setEditingArticle(null);
    };

    const handleEdit = (article: Article) => {
        setEditingArticle(article);
        setTitle(article.title);
        setSubtitle(article.subtitle);
        setContent(article.content);
        setAuthor(article.author);
        setCategory(article.category as CategoryType);
        setImageUrl(article.imageUrl);
        setReadTime(article.readTime.toString());
        setTags(article.tags.join(", "));
        setShowForm(true);
    };

    const handleDelete = (article: Article) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa bài "${article.title}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteArticle(article.id);
                            Alert.alert("Thành công", "Đã xóa bài viết");
                            loadArticles();
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể xóa bài viết");
                        }
                    },
                },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!title || !subtitle || !content || !author || !imageUrl) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            setSubmitting(true);
            const articleData = {
                title,
                subtitle,
                content: `<p>${content}</p>`,
                aiSummary: subtitle,
                author,
                category,
                imageUrl,
                publishedAt: new Date().toISOString(),
                readTime: parseInt(readTime) || 5,
                tags: tags.split(",").map((t) => t.trim()),
                views: 0,
            };

            if (editingArticle) {
                await updateArticle(editingArticle.id, articleData);
                Alert.alert("Thành công", "Đã cập nhật bài viết");
            } else {
                await createArticle(articleData);
                Alert.alert("Thành công", "Đã thêm bài viết mới");
            }

            setShowForm(false);
            resetForm();
            loadArticles();
        } catch (error) {
            Alert.alert("Lỗi", "Không thể lưu bài viết");
        } finally {
            setSubmitting(false);
        }
    };

    const renderArticleItem = ({ item }: { item: Article }) => (
        <View style={styles.articleItem}>
            <View style={styles.articleInfo}>
                <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.articleMeta}>
                    {item.category.toUpperCase()} • {item.author}
                </Text>
            </View>
            <View style={styles.articleActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(item)}
                >
                    <Ionicons name="create-outline" size={20} color="#0066cc" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Check if user is admin
    if (user?.role !== "admin") {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Quản lý bài viết</Text>
                </View>
                <View style={styles.unauthorizedContainer}>
                    <Ionicons name="lock-closed" size={64} color="#9ca3af" />
                    <Text style={styles.unauthorizedTitle}>Không có quyền truy cập</Text>
                    <Text style={styles.unauthorizedText}>
                        Bạn cần có quyền admin để truy cập trang này
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý bài viết</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        resetForm();
                        setShowForm(true);
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Articles List */}
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            ) : (
                <FlatList
                    data={articles}
                    renderItem={renderArticleItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Form Modal */}
            <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={0}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowForm(false);
                                    resetForm();
                                }}
                            >
                                <Text style={styles.cancelButton}>Hủy</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>
                                {editingArticle ? "Chỉnh sửa" : "Thêm bài viết"}
                            </Text>
                            <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                                <Text style={[styles.saveButton, submitting && styles.disabledButton]}>
                                    {submitting ? "Đang lưu..." : "Lưu"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            <Text style={styles.label}>Tiêu đề *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Nhập tiêu đề bài viết"
                            />

                            <Text style={styles.label}>Mô tả ngắn *</Text>
                            <TextInput
                                style={styles.input}
                                value={subtitle}
                                onChangeText={setSubtitle}
                                placeholder="Nhập mô tả ngắn"
                            />

                            <Text style={styles.label}>Nội dung *</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={content}
                                onChangeText={setContent}
                                placeholder="Nhập nội dung bài viết"
                                multiline
                                numberOfLines={6}
                            />

                            <Text style={styles.label}>Tác giả *</Text>
                            <TextInput
                                style={styles.input}
                                value={author}
                                onChangeText={setAuthor}
                                placeholder="Nhập tên tác giả"
                            />

                            <Text style={styles.label}>Danh mục *</Text>
                            <View style={styles.categoryPicker}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.categoryOption,
                                            category === cat.id && styles.categoryOptionActive,
                                        ]}
                                        onPress={() => setCategory(cat.id)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                category === cat.id && styles.categoryOptionTextActive,
                                            ]}
                                        >
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>URL hình ảnh *</Text>
                            <TextInput
                                style={styles.input}
                                value={imageUrl}
                                onChangeText={setImageUrl}
                                placeholder="https://images.unsplash.com/..."
                                autoCapitalize="none"
                            />

                            <Text style={styles.label}>Thời gian đọc (phút)</Text>
                            <TextInput
                                style={styles.input}
                                value={readTime}
                                onChangeText={setReadTime}
                                placeholder="5"
                                keyboardType="numeric"
                            />

                            <Text style={styles.label}>Tags (phân cách bằng dấu phẩy)</Text>
                            <TextInput
                                style={styles.input}
                                value={tags}
                                onChangeText={setTags}
                                placeholder="Công nghệ, AI, Nghiên cứu"
                            />

                            <View style={styles.formFooter} />
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: "PlayfairDisplay_700Bold",
        color: "#000",
    },
    addButton: {
        backgroundColor: "#000",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    unauthorizedContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    unauthorizedTitle: {
        fontSize: 20,
        fontFamily: "Inter_600SemiBold",
        color: "#000",
        marginTop: 16,
        marginBottom: 8,
    },
    unauthorizedText: {
        fontSize: 14,
        fontFamily: "Inter_400Regular",
        color: "#6b7280",
        textAlign: "center",
    },
    list: {
        padding: 16,
    },
    articleItem: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    articleInfo: {
        flex: 1,
        marginRight: 12,
    },
    articleTitle: {
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        color: "#000",
        marginBottom: 4,
    },
    articleMeta: {
        fontSize: 12,
        fontFamily: "Inter_400Regular",
        color: "#6b7280",
    },
    articleActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        padding: 8,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e5e5",
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: "Inter_600SemiBold",
        color: "#000",
    },
    cancelButton: {
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        color: "#6b7280",
    },
    saveButton: {
        fontSize: 16,
        fontFamily: "Inter_600SemiBold",
        color: "#0066cc",
    },
    disabledButton: {
        opacity: 0.5,
    },
    form: {
        flex: 1,
        padding: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: "Inter_600SemiBold",
        color: "#000",
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        fontFamily: "Inter_400Regular",
        color: "#000",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    categoryPicker: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f3f4f6",
        borderWidth: 1,
        borderColor: "#e5e5e5",
    },
    categoryOptionActive: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    categoryOptionText: {
        fontSize: 14,
        fontFamily: "Inter_500Medium",
        color: "#374151",
    },
    categoryOptionTextActive: {
        color: "#fff",
    },
    formFooter: {
        height: 40,
    },
});
