import React, { useEffect, useState } from "react";
import { Linking, Platform, View } from "react-native";
import { router } from "expo-router";
import { Host, Switch } from "@expo/ui";
import { useHealth } from "../hooks/use-health";
import {
  Page,
  Copy,
  Art,
  Field,
  Chips,
  Button,
  Action,
  Message,
  TimeField,
} from "../components/ui";
import { AppHeader, SectionHeading, SoftCard } from "../components/chrome";
import { colors as c } from "../theme";
import { setLock } from "../services/privacy";
import {
  getReminderStatus,
  ReminderStatus,
  scheduleReminder,
} from "../services/reminders";
import { exportData } from "../services/export";
import { pickImport } from "../services/import";
import Constants from "expo-constants";
import { Snapshot } from "../types";

function SettingToggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        minHeight: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <Copy style={{ flex: 1, fontWeight: "600" }}>{label}</Copy>
      <Host matchContents accessible accessibilityLabel={label}>
        <Switch value={value} onValueChange={onValueChange} />
      </Host>
    </View>
  );
}

export default function SettingsScreen() {
  const h = useHealth();
  const [name, setName] = useState(h.settings.name),
    [cycle, setCycle] = useState(String(h.settings.cycleLength)),
    [period, setPeriod] = useState(String(h.settings.periodLength)),
    [hour, setHour] = useState(h.settings.reminderHour),
    [message, setMessage] = useState(""),
    [confirm, setConfirm] = useState<"erase" | "export" | "import" | null>(null),
    [pendingImport, setPendingImport] = useState<Snapshot | null>(null),
    [reminderStatus, setReminderStatus] =
      useState<ReminderStatus>("reminderDisabled");
  useEffect(() => {
    void getReminderStatus(h.settings)
      .then(setReminderStatus)
      .catch(() => setReminderStatus("reminderNotScheduled"));
  }, [h.settings]);
  const toggle = async (key: "showFertility" | "reminder", value: boolean) => {
    try {
      const next = { ...h.settings, [key]: value };
      if (key === "reminder" && !(await scheduleReminder(next))) {
        setMessage(
          h.t(Platform.OS === "web" ? "unavailable" : "permissionDenied"),
        );
        return;
      }
      await h.saveSettings(next);
    } catch {
      setMessage(h.t("error"));
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader right="none" />
      <Page>
        <View style={{ alignItems: "center", gap: 8, paddingVertical: 8 }}>
          <Art name="heart" size={92} />
          <Copy kind="title" style={{ fontSize: 30 }}>
            {h.settings.name || h.t("profile")}
          </Copy>
          <Copy style={{ color: c.muted, textAlign: "center" }}>
            {h.t("profileBody")}
          </Copy>
        </View>
        {h.settings.demo && (
          <SoftCard tint={c.blush}>
            <Copy kind="heading">{h.t("demoBadge")}</Copy>
            <Copy>{h.t("demoBody")}</Copy>
          </SoftCard>
        )}
        <SoftCard tint={c.blush}>
          <SectionHeading
            icon="language-outline"
            tint={c.surface}
            title={h.t("language")}
          />
          <Chips
            options={["en", "sw"] as const}
            selected={[h.settings.language]}
            label={(v) => (v === "en" ? "English" : "Kiswahili")}
            onSelect={(v) => {
              void (async () => {
                try {
                  const next = { ...h.settings, language: v };
                  await h.saveSettings(next);
                  if (next.reminder) await scheduleReminder(next);
                } catch {
                  setMessage(h.t("error"));
                }
              })();
            }}
          />
        </SoftCard>
        <SoftCard>
          <SectionHeading
            icon="options-outline"
            tint={c.peach}
            title={h.t("preferences")}
            body={h.t("profileBody")}
          />
          <Field label={h.t("name")} value={name} onChangeText={setName} />
          <Field
            label={h.t("cycleLength")}
            value={cycle}
            onChangeText={setCycle}
            number
          />
          <Field
            label={h.t("periodLength")}
            value={period}
            onChangeText={setPeriod}
            number
          />
          <Copy kind="small" style={{ color: c.muted }}>
            {h.t("periodRange")}
          </Copy>
          <SettingToggle
            label={h.t("fertilityToggle")}
            value={h.settings.showFertility}
            onValueChange={(v) => {
              void toggle("showFertility", v);
            }}
          />
        </SoftCard>
        <SoftCard tint={c.lavender}>
          <SectionHeading
            icon="notifications-outline"
            tint={c.surface}
            title={h.t("reminders")}
            body={h.t("reminderBody")}
          />
          <SettingToggle
            label={h.t("reminders")}
            value={h.settings.reminder}
            onValueChange={(v) => {
              void toggle("reminder", v);
            }}
          />
          <TimeField
            label={h.t("reminderHour")}
            hour={hour}
            onChangeHour={setHour}
            language={h.settings.language}
          />
          <Message
            text={h.t(reminderStatus)}
            tone={
              reminderStatus === "reminderScheduled"
                ? "success"
                : reminderStatus === "reminderDenied" ||
                    reminderStatus === "reminderNotScheduled"
                  ? "warning"
                  : "info"
            }
          />
          {reminderStatus === "reminderDenied" && (
            <Button
              secondary
              title={h.t("openDeviceSettings")}
              onPress={() => {
                void Linking.openSettings();
              }}
            />
          )}
          <Action
            title={h.t("save")}
            onPress={async () => {
              if (
                !Number.isInteger(+cycle) ||
                +cycle < 15 ||
                +cycle > 90 ||
                !Number.isInteger(+period) ||
                +period < 1 ||
                +period > 15 ||
                +period >= +cycle ||
                !Number.isInteger(hour) ||
                +hour < 0 ||
                +hour > 23
              ) {
                setMessage(h.t("invalid"));
                return;
              }
              try {
                const next = {
                  ...h.settings,
                  name: name.trim(),
                  cycleLength: +cycle,
                  periodLength: +period,
                  reminderHour: hour,
                };
                await h.saveSettings(next);
                const scheduled = await scheduleReminder(next);
                setMessage(
                  h.t(scheduled ? "settingsSaved" : "notificationWarning"),
                );
              } catch {
                setMessage(h.t("error"));
              }
            }}
          />
        </SoftCard>
        <Message
          text={message}
          tone={
            message === h.t("settingsSaved") || message === h.t("importSaved")
              ? "success"
              : "warning"
          }
        />
        <SoftCard tint={c.sage}>
          <SectionHeading
            icon="shield-checkmark-outline"
            tint={c.surface}
            title={h.t("privacy")}
            body={h.t("privacyBody")}
          />
          <Copy style={{ color: c.muted }}>{h.t("lockBody")}</Copy>
          <SettingToggle
            label={h.t("lock")}
            value={h.lock}
            onValueChange={(v) => {
              void (async () => {
                try {
                  if (await setLock(v, h.t("unlock"))) h.setLockState(v);
                  else
                    setMessage(
                      h.t(
                        Platform.OS === "web" ? "unavailable" : "lockFailed",
                      ),
                    );
                } catch {
                  setMessage(h.t("error"));
                }
              })();
            }}
          />
        </SoftCard>
        <SoftCard tint={c.peach}>
          <SectionHeading
            icon="download-outline"
            tint={c.surface}
            title={h.t("export")}
            body={h.t("exportBody")}
          />
          <Button
            title={h.t("export")}
            chevron
            onPress={() => setConfirm("export")}
          />
          <Button
            secondary
            title={h.t("importData")}
            onPress={() => {
              void (async () => {
                try {
                  const snapshot = await pickImport();
                  if (!snapshot) return;
                  setPendingImport(snapshot);
                  setConfirm("import");
                } catch {
                  setMessage(h.t("importInvalid"));
                }
              })();
            }}
          />
          <Button
            secondary
            title={h.t("erase")}
            onPress={() => setConfirm("erase")}
          />
        </SoftCard>
        <SoftCard onPress={() => router.push("/help")}>
          <SectionHeading
            icon="information-circle-outline"
            tint={c.lavender}
            title={h.t("helpAndSafety")}
            body={h.t("helpBody")}
          />
        </SoftCard>
        {confirm && (
          <SoftCard tint={c.blush}>
            <SectionHeading
              icon={
                confirm === "erase"
                  ? "trash-outline"
                  : confirm === "import"
                    ? "cloud-upload-outline"
                    : "download-outline"
              }
              tint={c.surface}
              title={h.t(
                confirm === "erase"
                  ? "eraseTitle"
                  : confirm === "import"
                    ? "importData"
                    : "export",
              )}
            />
            <Copy>
              {h.t(
                confirm === "erase"
                  ? "eraseBody"
                  : confirm === "import"
                    ? "importWarning"
                    : "exportWarning",
              )}
            </Copy>
            <Action
              title={h.t(
                confirm === "erase"
                  ? "confirmErase"
                  : confirm === "import"
                    ? "confirmImport"
                    : "exportConfirm",
              )}
              onPress={async () => {
                try {
                  if (confirm === "erase") {
                    await h.erase();
                    router.replace("/onboarding");
                  } else if (confirm === "import" && pendingImport) {
                    await h.restore(pendingImport);
                    setPendingImport(null);
                    setConfirm(null);
                    setMessage(h.t("importSaved"));
                  } else {
                    await exportData({
                      settings: h.settings,
                      periods: h.periods,
                      logs: h.logs,
                    });
                    setConfirm(null);
                  }
                } catch {
                  setMessage(h.t("error"));
                }
              }}
            />
            <Button
              secondary
              title={h.t("cancel")}
              onPress={() => {
                setPendingImport(null);
                setConfirm(null);
              }}
            />
          </SoftCard>
        )}
        <Copy kind="small" style={{ color: c.muted, textAlign: "center" }}>
          {h.t("aboutBody")} · {h.t("appVersion", {
            version: Constants.expoConfig?.version ?? "1.0.0",
          })}
        </Copy>
      </Page>
    </View>
  );
}
