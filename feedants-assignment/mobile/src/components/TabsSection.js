import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, radius } from "../constants/theme";

const TABS = [
  { key: "about", label: "About Competition" },
  { key: "judging", label: "Judging Parameters" },
  { key: "rules", label: "Rules & Eligibility" },
];

export default function TabsSection({ about, judgingParameters, rulesEligibility }) {
  const [active, setActive] = useState("about");
  const [expanded, setExpanded] = useState(false);

  const content = {
    about: about.full || about.short,
    judging: judgingParameters,
    rules: rulesEligibility,
  }[active];

  const short = active === "about" ? about.short : content;
  const isLong = content && content.length > short?.length;
  const shown = expanded ? content : short;

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              setActive(tab.key);
              setExpanded(false);
            }}
            style={styles.tabBtn}
          >
            <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            {active === tab.key && <View style={styles.underline} />}
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.content}>{shown}</Text>
      {isLong && (
        <TouchableOpacity onPress={() => setExpanded((e) => !e)} style={styles.viewMoreBtn}>
          <Text style={styles.viewMore}>{expanded ? "View less" : "View more"} ⌄</Text>
        </TouchableOpacity>
      )}
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
  tabRow: { flexDirection: "row", gap: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md },
  tabBtn: { paddingBottom: spacing.sm },
  tabText: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  tabTextActive: { color: colors.teal },
  underline: { height: 2, backgroundColor: colors.teal, marginTop: 6, borderRadius: 2 },
  content: { fontSize: 13, color: colors.text, lineHeight: 20 },
  viewMoreBtn: { alignItems: "center", marginTop: spacing.sm },
  viewMore: { color: colors.teal, fontWeight: "600", fontSize: 13 },
});
