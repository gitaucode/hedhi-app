import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useHealth } from "../hooks/use-health";
import { Button, Copy, Page, Row } from "../components/ui";
import { Face } from "../components/faces";
import { IconBubble, SectionHeading, SoftCard } from "../components/chrome";
import { formatDate, today, validDate } from "../utils/dates";
import { colors as c } from "../theme";

export default function DayScreen() {
  const h = useHealth();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date && validDate(params.date) ? params.date : today();
  const log = h.logs.find((entry) => entry.date === date);
  const period = h.periods.find(
    (entry) => date >= entry.start && date <= (entry.end ?? today()),
  );
  const editLog = () => {
    h.setEditingDate(date);
    router.push("/check-in");
  };
  const editPeriod = () => {
    h.setEditingPeriod(period?.id ?? null);
    router.push({ pathname: "/period", params: { date } });
  };

  return (
    <Page>
      <View style={{ gap: 4, paddingVertical: 4 }}>
        <Copy kind="eyebrow" style={{ color: c.accent }}>
          {h.t("dayDetails")}
        </Copy>
        <Copy kind="title" style={{ fontSize: 28, lineHeight: 34 }}>
          {formatDate(date, h.settings.language, true)}
        </Copy>
        <Copy style={{ color: c.muted }}>{h.t("dayDetailsBody")}</Copy>
      </View>

      {period && (
        <SoftCard tint={c.blush}>
          <Row>
            <IconBubble name="water-outline" tint={c.surface} color={c.accent} />
            <View style={{ flex: 1, gap: 2 }}>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("periodStatus")}
              </Copy>
              <Copy style={{ fontWeight: "700" }}>{h.t("recorded")}</Copy>
            </View>
          </Row>
          <Button secondary title={h.t("editPeriod")} onPress={editPeriod} />
        </SoftCard>
      )}

      {log ? (
        <>
          <SoftCard>
            <SectionHeading icon="water-outline" tint={c.blush} title={h.t("flow")} />
            <Copy kind="heading">{h.t(log.flow)}</Copy>
          </SoftCard>

          <SoftCard>
            <SectionHeading icon="happy-outline" tint={c.peach} title={h.t("moods")} />
            {log.moods.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
                {log.moods.map((mood) => (
                  <View key={mood} style={{ alignItems: "center", gap: 2 }}>
                    <Face mood={mood} size={44} />
                    <Copy kind="small" style={{ color: c.muted }}>
                      {h.t(mood)}
                    </Copy>
                  </View>
                ))}
              </View>
            ) : (
              <Copy style={{ color: c.muted }}>{h.t("notRecorded")}</Copy>
            )}
          </SoftCard>

          <SoftCard>
            <SectionHeading
              icon="sparkles-outline"
              tint={c.lavender}
              title={h.t("symptoms")}
            />
            <Copy style={{ color: log.symptoms.length ? c.ink : c.muted }}>
              {log.symptoms.map((symptom) => h.t(symptom)).join(" · ") ||
                h.t("noSymptoms")}
            </Copy>
          </SoftCard>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {([
              ["pulse-outline", "pain", `${log.pain}/10`, c.blush],
              ["flash-outline", "energy", `${log.energy}/5`, c.peach],
              ["moon-outline", "sleep", log.sleep === null ? "—" : `${log.sleep} ${h.t("hours")}`, c.lavender],
            ] as const).map(([icon, label, value, tint]) => (
              <View key={label} style={{ flex: 1 }}>
                <SoftCard tint={tint} style={{ padding: 12, minHeight: 104 }}>
                  <IconBubble name={icon} tint={c.surface} />
                  <Copy kind="small" style={{ color: c.muted }}>
                    {h.t(label)}
                  </Copy>
                  <Copy style={{ fontWeight: "700" }}>{value}</Copy>
                </SoftCard>
              </View>
            ))}
          </View>

          <SoftCard>
            <Copy kind="small" style={{ color: c.muted }}>
              {h.t("discharge")}
            </Copy>
            <Copy style={{ fontWeight: "600" }}>{h.t(log.discharge)}</Copy>
            {!!log.notes && (
              <>
                <Copy kind="small" style={{ color: c.muted, paddingTop: 6 }}>
                  {h.t("notes")}
                </Copy>
                <Copy>{log.notes}</Copy>
              </>
            )}
          </SoftCard>
          <Button title={h.t("edit")} onPress={editLog} />
        </>
      ) : (
        <SoftCard tint={c.lavender} style={{ alignItems: "center" }}>
          <IconBubble name="calendar-outline" tint={c.surface} />
          <Copy kind="heading">{h.t("noDayDetails")}</Copy>
          <Copy style={{ color: c.muted, textAlign: "center" }}>{h.t("noDay")}</Copy>
          {date <= today() && <Button title={h.t("logToday")} onPress={editLog} />}
        </SoftCard>
      )}

      {!period && date <= today() && (
        <Button secondary title={h.t("startPeriod")} onPress={editPeriod} />
      )}
    </Page>
  );
}
