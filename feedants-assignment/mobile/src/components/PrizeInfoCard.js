import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

export default function PrizeInfoCard({ competition }) {
  const { title, tags, winnersGetCertificate, prizePool, entryFee, spots, viewer } = competition;
  const bookedPct = spots.total > 0 ? spots.booked / spots.total : 0;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {viewer.isRegistered && (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.teal} />
            <Text style={styles.registeredText}>Registered</Text>
          </View>
        )}
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {winnersGetCertificate && (
          <View style={styles.certRow}>
            <Ionicons name="trophy-outline" size={14} color={colors.teal} />
            <Text style={styles.certText}>Winners get certificate</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View>
          <Text style={styles.statLabel}>Prize Pool</Text>
          <Text style={styles.statValue}>₹ {prizePool}</Text>
        </View>
        <View>
          <Text style={styles.statLabel}>Entry Fee</Text>
          <Text style={styles.statValue}>₹ {entryFee}</Text>
        </View>
        <View style={styles.spotsBox}>
          <View style={styles.spotsHeaderRow}>
            <Ionicons name="people-outline" size={14} color={colors.teal} />
            <Text style={styles.spotsHeader}>
              {spots.left > 0 ? `Only ${spots.left} spots left` : "Fully booked"}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(bookedPct, 1) * 100}%` }]} />
          </View>
          <Text style={styles.spotsSub}>
            {spots.booked} / {spots.total} Booked
          </Text>
        </View>
      </View>
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
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontSize: 19, fontWeight: "800", color: colors.text, flexShrink: 1 },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.tealLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  registeredText: { color: colors.teal, fontWeight: "700", fontSize: 12 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.sm, alignItems: "center" },
  tag: { backgroundColor: "#F1F4F3", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontSize: 12, color: colors.text, fontWeight: "600" },
  certRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  certText: { fontSize: 12, color: colors.teal, fontWeight: "600" },
  statsRow: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.lg },
  statLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: colors.teal },
  spotsBox: { flex: 1 },
  spotsHeaderRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  spotsHeader: { fontSize: 12, color: colors.teal, fontWeight: "700" },
  progressTrack: { height: 4, backgroundColor: colors.border, borderRadius: 999, marginTop: 6, overflow: "hidden" },
  progressFill: { height: 4, backgroundColor: colors.teal, borderRadius: 999 },
  spotsSub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
