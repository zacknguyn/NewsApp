import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 40 }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Generate a consistent color based on the name
  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return "#" + "00000".substring(0, 6 - c.length) + c;
  };

  const backgroundColor = getColor(name || "User");

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay_700Bold",
  },
});
