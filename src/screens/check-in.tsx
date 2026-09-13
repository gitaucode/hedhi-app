import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useHealth, metadata } from "../hooks/use-health";
import { CheckIn, Mood } from "../types";
import {
  Page,
  Copy,
  Field,
  Chips,
  Action,
  Button,
  Message,
  Art,
  DateField,
} from "../components/ui";
import { SectionHeading, SoftCard } from "../components/chrome";
import { today, validDate } from "../utils/dates";
import { colors as c } from "../theme";

const moods: Mood[] = [
  "happy",
  "calm",
  "tired",
  "irritable",
  "sad",
  "anxious",
];

export default function CheckInScreen() {
  const h = useHealth();
  const params = useLocalSearchParams<{ mood?: string }>();
  const existing = h.logs.find((l) => l.date === h.editingDate);
  const seededMood =
    params.mood && moods.includes(params.mood as Mood)
      ? (params.mood as Mood)
      : null;
  const [log, setLog] = useState<CheckIn>(
    existing ?? {
      ...metadata(),
      date: h.editingDate,
      flow: "none",
      moods: seededMood ? [seededMood] : [],
      symptoms: [],
      pain: 0,
      energy: 3,
      sleep: null,
      discharge: "none",
      notes: "",
    },
  );
  const [sleep, setSleep] = useState(existing?.sleep?.toString() ?? ""),
    [error, setError] = useState(""),
    [deleting, setDeleting] = useState(false);
  const set = <K extends keyof CheckIn>(key: K, value: CheckIn[K]) =>
    setLog((l) => ({ ...l, [key]: value }));
  return (
    <Page>
      <View style={{ alignItems: "center", gap: 8, paddingVertical: 4 }}>
        <Art name="droplet" size={82} />
        <Copy kind="title" style={{ textAlign: "center" }}>
          {h.t("checkTitle")}
        </Copy>
        <Copy style={{ color: c.muted, textAlign: "center" }}>
          {h.t("checkSubtitle")}
        </Copy>
      </View>
      <SoftCard tint={c.blush}>
        <SectionHeading
          icon="calendar-outline"
          tint={c.surface}
          title={h.t("date")}
        />
        <DateField
          label={h.t("date")}
          value={log.date}
          onChangeText={(v) => set("date", v)}
          placeholder={h.t("dateHint")}
          language={h.settings.language}
          maximumDate={new Date()}
        />
        <SectionHeading
          icon="water-outline"
          tint={c.surface}
          title={h.t("flow")}
        />
        <Chips
          options={["none", "spotting", "light", "medium", "heavy"] as const}
          selected={[log.flow]}
          onSelect={(v) => set("flow", v)}
          label={h.t}
          columns={3}
        />
      </SoftCard>
      <SoftCard>
        <SectionHeading
          icon="happy-outline"
          tint={c.peach}
          title={h.t("moods")}
        />
        <Chips
          options={moods}
          selected={log.moods}
          onSelect={(v) =>
            set(
              "moods",
              log.moods.includes(v)
                ? log.moods.filter((x) => x !== v)
                : [...log.moods, v],
            )
          }
          label={h.t}
          columns={3}
        />
      </SoftCard>
      <SoftCard>
        <SectionHeading
          icon="sparkles-outline"
          tint={c.lavender}
          title={h.t("symptoms")}
        />
        <Chips
          options={
            [
              "cramps",
              "bloating",
              "headache",
              "tenderness",
              "acne",
              "backache",
            ] as const
          }
          selected={log.symptoms}
          onSelect={(v) =>
            set(
              "symptoms",
              log.symptoms.includes(v)
                ? log.symptoms.filter((x) => x !== v)
                : [...log.symptoms, v],
            )
          }
          label={h.t}
          icons={{
            cramps: require("../../assets/icons/symptoms/hedhi-symptom-cramps.png"),
            bloating: require("../../assets/icons/symptoms/hedhi-symptom-bloating.png"),
            headache: require("../../assets/icons/symptoms/hedhi-symptom-headache.png"),
            tenderness: require("../../assets/icons/symptoms/hedhi-symptom-tender-breasts.png"),
            acne: require("../../assets/icons/symptoms/hedhi-symptom-acne.png"),
            backache: require("../../assets/icons/symptoms/hedhi-symptom-backache.png"),
          }}
        />
      </SoftCard>
      <SoftCard tint={c.lavender}>
        <SectionHeading
          icon="pulse-outline"
          tint={c.surface}
          title={h.t("pain")}
          body={h.t("painHint")}
        />
        <Chips
          options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
          selected={[String(log.pain)]}
          onSelect={(v) => set("pain", +v)}
          label={(v) => v}
        />
      </SoftCard>
      <SoftCard tint={c.peach}>
        <SectionHeading
          icon="flash-outline"
          tint={c.surface}
          title={h.t("energy")}
          body={h.t("energyHint")}
        />
        <Chips
          options={["1", "2", "3", "4", "5"]}
          selected={[String(log.energy)]}
          onSelect={(v) => set("energy", +v)}
          label={(v) => v}
        />
      </SoftCard>
      <SoftCard>
        <SectionHeading
          icon="moon-outline"
          tint={c.lavender}
          title={h.t("sleep")}
        />
        <Field
          label={h.t("sleep")}
          value={sleep}
          onChangeText={setSleep}
          number
          placeholder={h.t("sleepHint")}
        />
        <SectionHeading
          icon="water-outline"
          tint={c.sage}
          title={h.t("discharge")}
        />
        <Chips
          options={
            ["none", "dry", "sticky", "creamy", "watery", "eggwhite"] as const
          }
          selected={[log.discharge]}
          onSelect={(v) => set("discharge", v)}
          label={h.t}
        />
        <Field
          label={h.t("notes")}
          value={log.notes}
          onChangeText={(v) => set("notes", v)}
          multiline
          placeholder={h.t("notesHint")}
        />
      </SoftCard>
      <Message text={error} />
      <Action
        title={h.t("save")}
        onPress={async () => {
          if (!validDate(log.date) || log.date > today()) {
            setError(h.t("future"));
            return;
          }
          if (
            sleep !== "" &&
            (!Number.isFinite(+sleep) || +sleep < 0 || +sleep > 24)
          ) {
            setError(h.t("invalid"));
            return;
          }
          const sameDay = h.logs.find(
            (l) => l.date === log.date && l.id !== log.id,
          );
          if (sameDay) {
            setError(h.t("invalid"));
            return;
          }
          try {
            await h.saveLog({ ...log, sleep: sleep === "" ? null : +sleep });
            router.back();
          } catch {
            setError(h.t("error"));
          }
        }}
      />
      {existing && (
        <Button
          secondary
          title={h.t("deleteEntry")}
          onPress={() => setDeleting(true)}
        />
      )}
      {deleting && (
        <SoftCard tint={c.blush}>
          <Copy>
            {h.t("deleteLog")} {h.t("confirmDelete")}
          </Copy>
          <Action
            title={h.t("delete")}
            onPress={async () => {
              try {
                await h.deleteLog(log.id);
                router.back();
              } catch {
                setError(h.t("error"));
              }
            }}
          />
          <Button
            secondary
            title={h.t("cancel")}
            onPress={() => setDeleting(false)}
          />
        </SoftCard>
      )}
    </Page>
  );
}
