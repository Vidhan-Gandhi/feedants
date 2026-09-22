import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

export default function InfoBanner({ disclaimer, prizeMoneyVideoUrl, refundPolicyUrl }) {
  return (
    <View>
      {!!disclaimer && (
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.teal} />
          <Text style={styles.disclaimerText}>{disclaimer}</Text>
        </View>
      )}
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => prizeMoneyVideoUrl && Linking.openURL(prizeMoneyVideoUrl)}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={16} color={colors.teal} />
          </View>
          <View>
            <Text style={styles.rowTitle}>How will you receive{"\n"}prize money?</Text>
            <Text style={styles.rowSub}>Watch video to know more</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.rightCol}>
          <View style={styles.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.text} />
            <Text style={styles.policyText}>Refund policy</Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.text} />
            <Text style={styles.policyText}>Secure payments powered by Razorpay</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disclaimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.tealLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  disclaimerText: { fontSize: 11, color: colors.tealDark, flex: 1 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 12, fontWeight: "700", color: colors.text },
  rowSub: { fontSize: 11, color: colors.textMuted },
  rightCol: { gap: 6, flex: 1 },
  policyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  policyText: { fontSize: 11, color: colors.text },
});
