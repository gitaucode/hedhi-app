import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useHealth } from "../hooks/use-health";
import { Page, Copy, Button, Chips, Art, Row } from "../components/ui";
import { IconBubble, SectionHeading, SoftCard } from "../components/chrome";
import { formatDate } from "../utils/dates";
import { colors as c } from "../theme";

export default function History() {
  const h = useHealth();
  const [filter, setFilter] = useState<
    "all" | "cramps" | "headache" | "bloating"
  >("all");
  return (
    <Page>
      <Row>
        <View style={{ flex: 1, gap: 6 }}>
          <Copy kind="eyebrow" style={{ color: c.accent }}>
            HEDHI
          </Copy>
          <Copy kind="title">{h.t("history")}</Copy>
        </View>
        <Art name="cloud" size={88} />
      </Row>
      <SectionHeading
        icon="water-outline"
        tint={c.blush}
        title={h.t("periods")}
      />
      <Button
        title={h.t("addPeriod")}
        chevron
        onPress={() => {
          h.setEditingPeriod(null);
          router.push("/period");
        }}
      />
      {!h.periods.length && (
        <SoftCard tint={c.blush} style={{ alignItems: "center" }}>
          <Art name="droplet" size={68} />
          <Copy style={{ color: c.muted, textAlign: "center" }}>
            {h.t("noPeriods")}
          </Copy>
        </SoftCard>
      )}
      {[...h.periods].reverse().map((p) => (
        <SoftCard key={p.id}>
          <Row>
            <IconBubble name="water-outline" tint={c.blush} color={c.accent} />
            <View style={{ flex: 1, gap: 2 }}>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("periods")}
              </Copy>
              <Copy kind="heading">
                {formatDate(p.start, h.settings.language)} –{" "}
                {p.end
                  ? formatDate(p.end, h.settings.language, true)
                  : h.t("ongoing")}
              </Copy>
            </View>
          </Row>
          <Button
            secondary
            title={h.t("editPeriod")}
            onPress={() => {
              h.setEditingPeriod(p.id);
              router.push("/period");
            }}
          />
        </SoftCard>
      ))}
      <SectionHeading
        icon="sparkles-outline"
        tint={c.lavender}
        title={h.t("symptomHistory")}
      />
      <Chips
        options={["all", "cramps", "headache", "bloating"] as const}
        selected={[filter]}
        label={h.t}
        onSelect={setFilter}
      />
      {!h.logs.filter(
        (l) => filter === "all" || l.symptoms.includes(filter as never),
      ).length && (
        <SoftCard tint={c.lavender} style={{ alignItems: "center" }}>
          <Art name="moon" size={68} />
          <Copy style={{ color: c.muted, textAlign: "center" }}>
            {h.t("noLogs")}
          </Copy>
        </SoftCard>
      )}
      {h.logs
        .filter((l) => filter === "all" || l.symptoms.includes(filter as never))
        .map((l) => (
          <SoftCard key={l.id}>
            <Row>
              <IconBubble name="calendar-outline" tint={c.peach} />
              <Copy kind="heading" style={{ flex: 1 }}>
                {formatDate(l.date, h.settings.language, true)}
              </Copy>
            </Row>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <SoftCard tint={c.blush} style={{ padding: 12 }}>
                  <Copy kind="small" style={{ color: c.muted }}>
                    {h.t("flow")}
                  </Copy>
                  <Copy style={{ fontWeight: "700" }}>{h.t(l.flow)}</Copy>
                </SoftCard>
              </View>
              <View style={{ flex: 1 }}>
                <SoftCard tint={c.lavender} style={{ padding: 12 }}>
                  <Copy kind="small" style={{ color: c.muted }}>
                    {h.t("pain")}
                  </Copy>
                  <Copy style={{ fontWeight: "700" }}>{l.pain}/10</Copy>
                </SoftCard>
              </View>
            </View>
            {!!l.moods.length && <Copy>{l.moods.map((m) => h.t(m)).join(" · ")}</Copy>}
            <Copy style={{ color: c.muted }}>
              {l.symptoms.map((s) => h.t(s)).join(" · ") || h.t("noSymptoms")}
            </Copy>
            <Copy kind="small" style={{ color: c.muted }}>
              {h.t("energy")}: {l.energy}/5 · {h.t("sleep")}: {l.sleep ?? "—"}{" "}
              {h.t("hours")}
            </Copy>
            {!!l.notes && <Copy>{l.notes}</Copy>}
            <Button
              secondary
              title={h.t("dayDetails")}
              onPress={() =>
                router.push({ pathname: "/day", params: { date: l.date } })
              }
            />
            <Button
              secondary
              title={h.t("edit")}
              onPress={() => {
                h.setEditingDate(l.date);
                router.push("/check-in");
              }}
            />
          </SoftCard>
        ))}
    </Page>
  );
}
