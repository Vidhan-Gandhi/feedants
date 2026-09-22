import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing, radius } from "../constants/theme";

/**
 * The single source of truth for "what should this button say and do"
 * lives on the backend (state + actions.canRegister / actions.canSubmit),
 * this component just renders whichever branch applies. That keeps the
 * business rules in one place instead of being re-implemented (and
 * potentially getting out of sync) on the client.
 */
export default function BottomActionBar({ competition, pending, onRegister, onUpload }) {
  const { state, actions, viewer, entryFee } = competition;

  let title = "";
  let subtitle = "";
  let disabled = false;
  let onPress = null;

  if (!viewer.isRegistered) {
    if (actions.canRegister) {
      title = `Register • ₹${entryFee}`;
      onPress = onRegister;
    } else if (state === "registration_full") {
      title = "Registration Full";
      disabled = true;
    } else {
      title = "Registration Closed";
      disabled = true;
    }
  } else {
    subtitle = "Registered";
    if (state === "awaiting_submission") {
      title = "Submissions Open Soon";
      disabled = true;
    } else if (actions.canSubmit) {
      title = viewer.hasSubmitted ? "Update Submission" : "Upload Submission";
      onPress = onUpload;
    } else if (state === "judging") {
      title = "Submission Closed — Judging";
      disabled = true;
    } else if (state === "results_declared") {
      title = "Results Declared";
      disabled = true;
    } else {
      title = "Upload Submission";
      disabled = true;
    }
  }

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled || pending || !onPress}
        onPress={onPress}
      >
        {pending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.buttonText}>{title}</Text>
            {!!subtitle && <Text style={styles.buttonSubtext}>{subtitle}</Text>}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.teal,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#9FB8B5" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  buttonSubtext: { color: "#E3F4F1", fontSize: 11, marginTop: 2 },
});
