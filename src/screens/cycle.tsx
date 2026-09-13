import { View } from "react-native";
import { useHealth } from "../hooks/use-health";
import { Copy, Page, Row } from "../components/ui";
import { IconBubble, SectionHeading, SoftCard } from "../components/chrome";
import { calculateCycle } from "../services/cycle";
import { formatDate, today } from "../utils/dates";
import { colors as c } from "../theme";

export default function CycleScreen() {
  const h = useHealth();
  const cycle = calculateCycle(h.periods, h.settings, today());
  const confidence =
    cycle.sampleSize >= 3
      ? "confidencePersonalized"
      : cycle.sampleSize > 0
        ? "confidenceGrowing"
        : "confidenceEarly";
  const basis = cycle.sampleSize
    ? h.t("predictionBasis", { count: cycle.sampleSize })
    : h.t("setupBasis");
  const phase =
    cycle.phase === "menstrual" ||
    cycle.phase === "follicular" ||
    cycle.phase === "ovulatory" ||
    cycle.phase === "luteal"
      ? cycle.phase
      : "unknown";

  return (
    <Page>
      <View style={{ gap: 4, paddingVertical: 4 }}>
        <Copy kind="title" style={{ fontSize: 30, lineHeight: 36 }}>
          {h.t("cycleDetails")}
        </Copy>
        <Copy style={{ color: c.muted }}>{h.t("cycleDetailsBody")}</Copy>
      </View>

      <SoftCard tint={c.blush}>
        <Copy kind="eyebrow" style={{ color: c.accent }}>
          {h.t("cycleDay")}
        </Copy>
        <Copy kind="title" style={{ color: c.plum }}>
          {cycle.day ?? "—"}
        </Copy>
        <Copy style={{ fontWeight: "700" }}>{h.t(phase)}</Copy>
        <Copy style={{ color: c.muted }}>{h.t("phaseNote")}</Copy>
      </SoftCard>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <SoftCard>
            <Copy kind="small" style={{ color: c.muted }}>
              {h.t("averageCycle")}
            </Copy>
            <Copy kind="heading">{cycle.average} {h.t("days")}</Copy>
          </SoftCard>
        </View>
        <View style={{ flex: 1 }}>
          <SoftCard>
            <Copy kind="small" style={{ color: c.muted }}>
              {h.t("averagePeriod")}
            </Copy>
            <Copy kind="heading">{cycle.periodLength} {h.t("days")}</Copy>
          </SoftCard>
        </View>
      </View>

      <SoftCard>
        <SectionHeading
          icon="calendar-outline"
          tint={c.peach}
          title={h.t("upcomingEstimates")}
        />
        {[
          ["nextPeriod", cycle.next],
          ["fertileWindow", cycle.fertileStart && cycle.fertileEnd
            ? `${formatDate(cycle.fertileStart, h.settings.language)} – ${formatDate(cycle.fertileEnd, h.settings.language)}`
            : null],
        ].map(([label, value]) => (
          <Row key={label}>
            <Copy style={{ flex: 1, color: c.muted }}>{h.t(label as "nextPeriod" | "fertileWindow")}</Copy>
            <Copy style={{ fontWeight: "700", textAlign: "right" }}>
              {value
                ? label === "nextPeriod"
                  ? formatDate(value, h.settings.language, true)
                  : value
                : "—"}
            </Copy>
          </Row>
        ))}
      </SoftCard>

      <SoftCard tint={c.sage}>
        <Row>
          <IconBubble name="analytics-outline" tint={c.surface} color={c.green} />
          <View style={{ flex: 1, gap: 2 }}>
            <Copy kind="small" style={{ color: c.green }}>
              {h.t("predictionConfidence")}
            </Copy>
            <Copy kind="heading" style={{ color: c.green }}>
              {h.t(confidence)}
            </Copy>
          </View>
        </Row>
        <Copy style={{ color: c.green }}>{basis}</Copy>
      </SoftCard>

      <SoftCard tint={c.lavender}>
        <Copy kind="heading">{h.t("predictionsTitle")}</Copy>
        <Copy style={{ color: c.muted }}>{h.t("predictionsBody")}</Copy>
        <Copy kind="small" style={{ color: c.muted }}>{h.t("predictionNote")}</Copy>
      </SoftCard>
    </Page>
  );
}
