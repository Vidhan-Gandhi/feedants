import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

export default function JudgeCard({ judge, onPlayIntro }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: judge.photoUrl }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.label}>Judge</Text>
        <Text style={styles.name}>{judge.name}</Text>
        {!!judge.title && <Text style={styles.sub}>{judge.title}</Text>}
        {!!judge.experience && <Text style={styles.sub}>{judge.experience}</Text>}
      </View>
      <TouchableOpacity style={styles.playBtn} onPress={onPlayIntro} disabled={!judge.introVideoUrl}>
        <Ionicons name="play" size={20} color={colors.teal} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.border },
  info: { flex: 1 },
  label: { fontSize: 11, color: colors.textMuted },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  sub: { fontSize: 11, color: colors.textMuted },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tealLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
