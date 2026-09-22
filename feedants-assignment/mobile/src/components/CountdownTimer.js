import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

function formatDuration(ms) {
  if (ms <= 0) return { d: "00", h: "00", m: "00", s: "00", expired: true };
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s), expired: false };
}

/**
 * label + targetAt come straight from the backend (see utils/lifecycle.js)
 * so this component never has to guess *which* deadline it's counting
 * down to - it just renders whatever the current lifecycle state implies.
 */
export default function CountdownTimer({ label, targetAt, getCorrectedNow, onExpire }) {
  const [now, setNow] = useState(getCorrectedNow());

  useEffect(() => {
    const id = setInterval(() => setNow(getCorrectedNow()), 1000);
    return () => clearInterval(id);
  }, [getCorrectedNow]);

  const remaining = new Date(targetAt).getTime() - now;
  const { d, h, m, s, expired } = formatDuration(remaining);

  useEffect(() => {
    if (expired && onExpire) onExpire();
  }, [expired, onExpire]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Ionicons name="hourglass-outline" size={18} color={colors.teal} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {!expired ? (
        <Text style={styles.time}>
          {d}d : {h}h : {m}m : {s}s
        </Text>
      ) : (
        <Text style={styles.time}>Updating…</Text>
      )}
      <View style={styles.right}>
        <Ionicons name="alarm-outline" size={16} color={colors.teal} />
        <Text style={styles.hurry}>Hurry up!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.tealLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { color: colors.tealDark, fontWeight: "600", fontSize: 13 },
  time: { color: colors.tealDark, fontWeight: "700", fontSize: 14 },
  right: { flexDirection: "row", alignItems: "center", gap: 4 },
  hurry: { color: colors.tealDark, fontSize: 12, fontWeight: "600" },
});
