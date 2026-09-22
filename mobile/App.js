import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { api, setAuthToken } from "./src/api/client";
import { colors } from "./src/constants/theme";
import { DEMO_COMPETITION_ID } from "./src/constants/config";
import CompetitionDetailsScreen from "./src/screens/CompetitionDetailsScreen";

/**
 * App entry: performs a "demo login" (see backend authController) so the
 * Competition Details screen can immediately exercise the register /
 * submit flows as an authenticated user. A production app would route
 * to a real auth flow first and only mount this screen once logged in.
 */
export default function App() {
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { token } = await api.demoLogin("Demo User");
        setAuthToken(token);
        setReady(true);
      } catch (err) {
        setBootError(
          "Could not reach the backend. Make sure it's running and API_BASE_URL in src/constants/config.js points to it."
        );
      }
    })();
  }, []);

  if (bootError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{bootError}</Text>
      </SafeAreaView>
    );
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.teal} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.flex}>
      <StatusBar style="dark" />
      <CompetitionDetailsScreen competitionId={DEMO_COMPETITION_ID} onBack={() => {}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, padding: 24 },
  errorText: { color: "#C0392B", textAlign: "center", fontSize: 14 },
});
