// src/components/SeedDatabaseButton.tsx
// Add this to your Settings or Admin screen to easily seed the database
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { seedFirebase, clearArticles } from "../utils/seedFirebase";

export default function SeedDatabaseButton() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn thêm dữ liệu mẫu vào database?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đồng ý",
        onPress: async () => {
          setLoading(true);
          try {
            const success = await seedFirebase();
            if (success) {
              Alert.alert("Thành công", "Đã thêm dữ liệu mẫu vào database!");
            } else {
              Alert.alert("Thông báo", "Dữ liệu đã tồn tại hoặc có lỗi xảy ra");
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể thêm dữ liệu");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleClear = async () => {
    Alert.alert(
      "Cảnh báo",
      "Bạn có chắc muốn XÓA TẤT CẢ bài viết? Hành động này không thể hoàn tác!",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await clearArticles();
              if (success) {
                Alert.alert("Thành công", "Đã xóa tất cả bài viết!");
              } else {
                Alert.alert("Lỗi", "Không thể xóa bài viết");
              }
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa bài viết");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý Database</Text>

      <TouchableOpacity
        style={[styles.button, styles.seedButton]}
        onPress={handleSeed}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Thêm dữ liệu mẫu</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.clearButton]}
        onPress={handleClear}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Xóa tất cả bài viết</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>⚠️ Chỉ sử dụng cho mục đích phát triển</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  seedButton: {
    backgroundColor: "#3b82f6",
  },
  clearButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  note: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
});
