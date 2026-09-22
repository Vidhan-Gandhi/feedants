import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../constants/theme";

export default function Header({ onBack }) {
  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
        <Text style={styles.backText}>Go back</Text>
      </TouchableOpacity>
      <View style={styles.langToggle}>
        <View style={styles.langPillActive}>
          <Text style={styles.langActiveText}>ENG</Text>
        </View>
        <Text style={styles.langInactiveText}>हिंदी</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontSize: 16, fontWeight: "600", color: colors.text },
  langToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.tealLight,
    borderRadius: 999,
    padding: 3,
    gap: 6,
  },
  langPillActive: { backgroundColor: colors.teal, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  langActiveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  langInactiveText: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 6 },
});
