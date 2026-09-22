import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

export default function PreviousWinners({ winners }) {
  if (!winners || winners.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {winners.map((w, idx) => (
          <TouchableOpacity key={`${w.name}-${idx}`} style={styles.item}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: w.photoUrl }} style={styles.image} />
              <View style={styles.playIcon}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>{w.name}</Text>
            <Text style={styles.position}>{w.position}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, paddingLeft: spacing.lg },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  row: { gap: spacing.md, paddingRight: spacing.lg },
  item: { width: 96 },
  imageWrap: { width: 96, height: 96, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.border },
  image: { width: "100%", height: "100%" },
  playIcon: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: colors.teal,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 12, fontWeight: "700", color: colors.text, marginTop: 6 },
  position: { fontSize: 11, color: colors.teal },
});
