import React from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HealthProvider, useHealth } from "../hooks/use-health";
import { Loading, Page, Copy, Button, Shell } from "../components/ui";
import { authenticate } from "../services/privacy";
import { colors } from "../theme";

function Routes() {
  const h = useHealth();
  if (h.loading) return <Loading />;
  if (h.failed)
    return (
      <Page>
        <Copy>{h.t("error")}</Copy>
        <Button title={h.t("retry")} onPress={h.initialize} />
      </Page>
    );
  if (h.locked)
    return (
      <Page>
        <Copy kind="title">{h.t("locked")}</Copy>
        <Button
          title={h.t("unlock")}
          onPress={async () => {
            if (await authenticate(h.t("unlock"))) h.setLocked(false);
          }}
        />
      </Page>
    );
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.plum,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            fontFamily:
              Platform.OS === "ios" ? "Georgia" : undefined,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="check-in"
          options={{ title: h.t("log"), presentation: "modal" }}
        />
        <Stack.Screen
          name="period"
          options={{ title: h.t("periods"), presentation: "modal" }}
        />
        <Stack.Screen name="day" options={{ title: h.t("dayDetails") }} />
        <Stack.Screen name="cycle" options={{ title: h.t("cycleDetails") }} />
        <Stack.Screen name="help" options={{ title: h.t("helpAndSafety") }} />
        <Stack.Screen name="history" options={{ title: "" }} />
      </Stack>
    </>
  );
}
export default function Layout() {
  return (
    <HealthProvider>
      <Shell>
        <Routes />
      </Shell>
    </HealthProvider>
  );
}
