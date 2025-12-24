// src/screens/Main/SettingsScreen.tsx
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
import SeedDatabaseButton from "../../components/SeedDatabaseButton";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("ChangePassword" as never)}
            >
              <Ionicons name="key-outline" size={24} color="#000" />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Đổi mật khẩu</Text>
                <Text style={styles.menuSubtext}>
                  Thay đổi mật khẩu đăng nhập
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngôn ngữ</Text>
          <View style={styles.card}>
            <View style={styles.menuItem}>
              <Ionicons name="globe-outline" size={24} color="#000" />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Tiếng Việt</Text>
                <Text style={styles.menuSubtext}>Ngôn ngữ hiện tại</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin ứng dụng</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phiên bản</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nền tảng</Text>
              <Text style={styles.infoValue}>React Native</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>Expo</Text>
            </View>
          </View>
        </View>

        {/* Show seed button only for admin users */}
        {user?.role === "admin" && (
          <View style={styles.section}>
            <SeedDatabaseButton />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Về chúng tôi</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#000"
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Điều khoản sử dụng</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#000"
              />
              <View style={styles.menuContent}>
                <Text style={styles.menuText}>Chính sách bảo mật</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#000",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#000",
  },
  menuSubtext: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#000",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
});
