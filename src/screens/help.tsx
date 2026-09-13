import { View } from "react-native";
import { useHealth } from "../hooks/use-health";
import { Copy, Page } from "../components/ui";
import { IconBubble, SoftCard } from "../components/chrome";
import { colors as c } from "../theme";

const sections = [
  ["shield-checkmark-outline", "privacySummaryTitle", "privacySummaryBody", c.sage],
  ["analytics-outline", "predictionsTitle", "predictionsBody", c.lavender],
  ["medkit-outline", "disclaimerTitle", "disclaimerBody", c.peach],
  ["alert-circle-outline", "urgentCareTitle", "urgentCareBody", c.blush],
] as const;

export default function HelpScreen() {
  const h = useHealth();
  return (
    <Page>
      <View style={{ gap: 4, paddingVertical: 4 }}>
        <Copy kind="title" style={{ fontSize: 30, lineHeight: 36 }}>
          {h.t("helpAndSafety")}
        </Copy>
        <Copy style={{ color: c.muted }}>{h.t("helpBody")}</Copy>
      </View>
      {sections.map(([icon, title, body, tint]) => (
        <SoftCard key={title} tint={tint}>
          <IconBubble name={icon} tint={c.surface} />
          <Copy kind="heading">{h.t(title)}</Copy>
          <Copy style={{ color: c.muted }}>{h.t(body)}</Copy>
        </SoftCard>
      ))}
      <Copy kind="small" style={{ color: c.muted, textAlign: "center" }}>
        {h.t("predictionNote")}
      </Copy>
    </Page>
  );
}
