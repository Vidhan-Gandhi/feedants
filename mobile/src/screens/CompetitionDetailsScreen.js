import React, { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View, ActivityIndicator, Platform, StatusBar } from "react-native";
import { colors, spacing } from "../constants/theme";
import { useCompetition } from "../hooks/useCompetition";
import Header from "../components/Header";
import PrizeInfoCard from "../components/PrizeInfoCard";
import JudgeCard from "../components/JudgeCard";
import CountdownTimer from "../components/CountdownTimer";
import ImportantDates from "../components/ImportantDates";
import PreviousWinners from "../components/PreviousWinners";
import TabsSection from "../components/TabsSection";
import RewardsList from "../components/RewardsList";
import InfoBanner from "../components/InfoBanner";
import ReferralCard from "../components/ReferralCard";
import BottomActionBar from "../components/BottomActionBar";

export default function CompetitionDetailsScreen({ competitionId, onBack }) {
  const { data, loading, error, actionPending, register, submit, refresh, getCorrectedNow } = useCompetition(competitionId);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleRegister = async () => {
    const result = await register();
    if (!result.ok) {
      // Handles the "someone else took the last spot between load and tap"
      // race explicitly, instead of a generic failure message.
      if (result.code === "SPOTS_FULL") {
        Alert.alert("Spots full", "All spots were just taken. This competition is now full.");
      } else if (result.code === "REGISTRATION_CLOSED") {
        Alert.alert("Registration closed", "Registration closed while you were viewing this page.");
      } else if (result.code === "ALREADY_REGISTERED") {
        Alert.alert("Already registered", "You're already registered for this competition.");
      } else {
        Alert.alert("Couldn't register", result.message || "Please try again.");
      }
    }
  };

  const handleUpload = async () => {
    // A real app would open a file/video picker + upload to storage first.
    // Here we simulate that step and submit a placeholder URL so the
    // full state transition (unregistered -> registered -> submitted)
    // can be exercised end-to-end.
    const fakeUploadedUrl = `https://uploads.feedants.com/demo/${competitionId}-${Date.now()}.mp4`;
    const result = await submit(fakeUploadedUrl, "video");
    if (result.ok) {
      Alert.alert("Submitted", "Your entry has been submitted for judging.");
    } else {
      Alert.alert("Couldn't submit", result.message || "Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Something went wrong"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <Header onBack={onBack} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.teal} />}
      >
        <PrizeInfoCard competition={data} />
        <JudgeCard judge={data.judge} onPlayIntro={() => {}} />
        <CountdownTimer
          label={data.countdown.label}
          targetAt={data.countdown.targetAt}
          getCorrectedNow={getCorrectedNow}
          onExpire={refresh}
        />
        <ImportantDates dates={data.dates} />
        <PreviousWinners winners={data.previousWinners} />
        <TabsSection about={data.about} judgingParameters={data.judgingParameters} rulesEligibility={data.rulesEligibility} />
        <RewardsList rewards={data.rewards} />
        <InfoBanner disclaimer={data.disclaimer} prizeMoneyVideoUrl={data.prizeMoneyVideoUrl} refundPolicyUrl={data.refundPolicyUrl} />
        <ReferralCard referral={data.referral} />
      </ScrollView>
      <BottomActionBar competition={data} pending={actionPending} onRegister={handleRegister} onUpload={handleUpload} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  errorText: { color: colors.danger, fontSize: 14, paddingHorizontal: spacing.xl, textAlign: "center" },
});
