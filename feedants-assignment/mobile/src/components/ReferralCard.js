import React from "react";
import { Clipboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

export default function ReferralCard({ referral }) {
  if (!referral) return null;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="megaphone-outline" size={20} color={colors.teal} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Refer & Earn more discount</Text>
        </View>
      </View>
      <View style={styles.linkRow}>
        <Text style={styles.link} numberOfLines={1}>{referral.link}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={() => Clipboard.setString(referral.link)}>
          <Text style={styles.copyText}>Copy Link</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.referBtn}>
          <Text style={styles.referText}>Refer Now</Text>
        </TouchableOpacity>
        <Text style={styles.earnText}>You earn ₹{referral.rewardPerSignup} for every signup</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tealLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  title: { fontSize: 14, fontWeight: "700", color: colors.text },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingLeft: spacing.md,
  },
  link: { flex: 1, fontSize: 12, color: colors.teal },
  copyBtn: { paddingVertical: 10, paddingHorizontal: spacing.md },
  copyText: { fontSize: 12, fontWeight: "700", color: colors.teal },
  footerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
  referBtn: { backgroundColor: colors.teal, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: spacing.lg },
  referText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  earnText: { fontSize: 11, color: colors.tealDark, flex: 1 },
});
