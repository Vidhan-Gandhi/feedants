import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

const ICONS = {
  trophy: { name: "trophy", color: colors.gold },
  medal: { name: "medal", color: colors.silver },
  "bronze-medal": { name: "medal", color: colors.bronze },
  star: { name: "star-outline", color: colors.teal },
};

export default function RewardsList({ rewards }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Rewards <Text style={styles.sub}>(All Positions)</Text>
      </Text>
      {rewards.map((r) => {
        const icon = ICONS[r.icon] || ICONS.star;
        return (
          <View key={r.position} style={styles.row}>
            <View style={styles.left}>
              <Ionicons name={icon.name} size={16} color={icon.color} />
              <Text style={styles.label}>{r.label}</Text>
            </View>
            <Text style={styles.amount}>₹ {r.amount}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  sub: { fontSize: 12, color: colors.textMuted, fontWeight: "400" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, color: colors.text, fontWeight: "600" },
  amount: { fontSize: 14, color: colors.teal, fontWeight: "700" },
});
