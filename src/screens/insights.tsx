import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useHealth } from "../hooks/use-health";
import { Page, Copy, Art, Row, Button, Chips } from "../components/ui";
import { AppHeader, SectionHeading, SoftCard } from "../components/chrome";
import { calculateCycle } from "../services/cycle";
import { addDays, today } from "../utils/dates";
import { colors as c } from "../theme";
import { Symptom } from "../types";

export default function Insights() {
  const h = useHealth();
  const [range, setRange] = useState<"30" | "90" | "all">("90");
  const [category, setCategory] = useState<"all" | "symptoms" | "wellbeing">("all");
  const cutoff = range === "all" ? null : addDays(today(), -(Number(range) - 1));
  const filteredLogs = h.logs.filter((log) => !cutoff || log.date >= cutoff);
  const cycle = calculateCycle(h.periods, h.settings, today()),
    sleep = filteredLogs.filter((l) => l.sleep !== null),
    frequencies = Object.entries(
      filteredLogs.reduce<Record<string, number>>((acc, l) => {
        l.symptoms.forEach((s) => (acc[s] = (acc[s] ?? 0) + 1));
        return acc;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader />
      <Page>
        <Row>
          <View style={{ flex: 1 }}>
            <Copy kind="title" style={{ fontSize: 32, lineHeight: 38 }}>
              {h.t("patterns")}
            </Copy>
          </View>
          <Art name="cloud" size={88} />
        </Row>
        <Copy style={{ color: c.muted }}>{h.t("patternsBody")}</Copy>
        <SoftCard>
          <Copy kind="small" style={{ color: c.muted, fontWeight: "700" }}>
            {h.t("dateRange")}
          </Copy>
          <Chips
            options={["30", "90", "all"] as const}
            selected={[range]}
            onSelect={setRange}
            label={(value) =>
              value === "30"
                ? h.t("last30Days")
                : value === "90"
                  ? h.t("last90Days")
                  : h.t("allTime")
            }
          />
          <Copy kind="small" style={{ color: c.muted, fontVariant: ["tabular-nums"] }}>
            {h.t("checkInCount", { count: filteredLogs.length })}
          </Copy>
          <Copy kind="small" style={{ color: c.muted, fontWeight: "700", paddingTop: 4 }}>
            {h.t("category")}
          </Copy>
          <Chips
            options={["all", "symptoms", "wellbeing"] as const}
            selected={[category]}
            onSelect={setCategory}
            label={h.t}
          />
        </SoftCard>
        {category === "all" && <Row>
          {(["averageCycle", "averagePeriod"] as const).map((key, i) => (
            <View key={key} style={{ flex: 1 }}>
              <SoftCard tint={i ? c.lavender : c.blush}>
                <Copy kind="small" style={{ fontWeight: "600", color: c.muted }}>
                  {h.t(key)}
                </Copy>
                <Copy kind="title" style={{ color: c.plum, fontSize: 36 }}>
                  {i ? cycle.periodLength : cycle.average}
                </Copy>
                <Copy kind="small">
                  {h.t("days")} ·{" "}
                  {cycle.sampleSize ? h.t("history") : h.t("estimate")}
                </Copy>
              </SoftCard>
            </View>
          ))}
        </Row>}
        {category === "all" && <SoftCard>
          <SectionHeading
            icon="analytics-outline"
            tint={c.blush}
            title={h.t("recentCycles")}
          />
          {cycle.lengths.length ? (
            cycle.lengths.slice(-6).map((length, i) => (
              <Row key={i}>
                <Copy kind="small" style={{ width: 22, color: c.muted }}>
                  {i + 1}
                </Copy>
                <View
                  style={{
                    flex: 1,
                    height: 12,
                    backgroundColor: c.blush,
                    borderRadius: 7,
                  }}
                >
                  <View
                    style={{
                      width: `${Math.max(8, (length / Math.max(...cycle.lengths)) * 100)}%`,
                      height: 12,
                      backgroundColor: c.rose,
                      borderRadius: 7,
                    }}
                  />
                </View>
                <Copy style={{ width: 58, fontSize: 13 }}>
                  {length} {h.t("days")}
                </Copy>
              </Row>
            ))
          ) : (
            <Copy>{h.t("needMore")}</Copy>
          )}
        </SoftCard>}
        {(category === "all" || category === "symptoms") && <SoftCard tint={c.sage}>
          <SectionHeading
            icon="sparkles-outline"
            tint={c.surface}
            title={h.t("frequentSymptoms")}
          />
          {frequencies.length ? (
            frequencies.map(([symptom, count]) => (
              <Row key={symptom}>
                <Copy style={{ flex: 1 }}>{h.t(symptom as Symptom)}</Copy>
                <Copy kind="small" style={{ color: c.muted }}>
                  {h.t("entries", { count })}
                </Copy>
              </Row>
            ))
          ) : (
            <Copy>{h.t("noSymptoms")}</Copy>
          )}
        </SoftCard>}
        {(category === "all" || category === "wellbeing") && <Row>
          <View style={{ flex: 1 }}>
            <SoftCard tint={c.lavender}>
              <Art name="moon" size={52} />
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("sleepAverage")}
              </Copy>
              <Copy kind="heading">
                {sleep.length
                  ? (
                      sleep.reduce((a, l) => a + l.sleep!, 0) / sleep.length
                    ).toFixed(1)
                  : "—"}{" "}
                {h.t("hours")}
              </Copy>
            </SoftCard>
          </View>
          <View style={{ flex: 1 }}>
            <SoftCard tint={c.peach}>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("variation")}
              </Copy>
              <Copy kind="heading">
                {cycle.variability ?? "—"} {h.t("days")}
              </Copy>
              <Copy kind="small">{h.t("variationHint")}</Copy>
            </SoftCard>
          </View>
        </Row>}
        <Button
          title={h.t("symptomHistory")}
          secondary
          onPress={() => router.push("/history")}
        />
        <Copy kind="small" style={{ color: c.muted }}>
          {h.t("predictionNote")}
        </Copy>
      </Page>
    </View>
  );
}
