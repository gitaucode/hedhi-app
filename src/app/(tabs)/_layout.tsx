import { Redirect, Tabs } from "expo-router";
import { useHealth } from "../../hooks/use-health";
import { Dock } from "../../components/chrome";

export default function Layout() {
  const { settings, t } = useHealth();
  if (!settings.onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      tabBar={(props) => <Dock {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("home") }} />
      <Tabs.Screen name="insights" options={{ title: t("insights") }} />
      <Tabs.Screen name="calendar" options={{ title: t("calendar") }} />
      <Tabs.Screen name="you" options={{ title: t("you") }} />
    </Tabs>
  );
}
