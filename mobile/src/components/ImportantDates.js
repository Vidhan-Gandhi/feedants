import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../constants/theme";

function formatDate(iso) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" });
  const year = String(d.getFullYear()).slice(-2);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return { date: `${day} ${month} ${year}`, time: `${hours}:${minutes} ${ampm}` };
}

function DateCell({ icon, label, iso }) {
  const { date, time } = formatDate(iso);
  return (
    <View style={styles.cell}>
      <Ionicons name={icon} size={18} color={colors.teal} style={{ marginTop: 2 }} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    </View>
  );
}

export default function ImportantDates({ dates }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Important Dates</Text>
      <View style={styles.grid}>
        <DateCell icon="calendar-outline" label="Register Before" iso={dates.registrationCloseAt} />
        <DateCell icon="paper-plane-outline" label="Submission Starts" iso={dates.submissionStartAt} />
        <DateCell icon="arrow-up-circle-outline" label="Submission Ends" iso={dates.submissionEndAt} />
        <DateCell icon="trophy-outline" label="Result Date" iso={dates.resultDate} />
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
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  cell: { flexDirection: "row", gap: 8, width: "42%" },
  label: { fontSize: 11, color: colors.textMuted },
  date: { fontSize: 13, fontWeight: "700", color: colors.text },
  time: { fontSize: 12, color: colors.text },
});
