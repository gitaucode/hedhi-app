import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useHealth, metadata } from "../hooks/use-health";
import {
  Page,
  Copy,
  Art,
  Button,
  Action,
  Field,
  Message,
  Chips,
  DateField,
} from "../components/ui";
import { Brand, SoftCard } from "../components/chrome";
import { colors as c } from "../theme";
import { today, validDate, addDays } from "../utils/dates";

export default function Onboarding() {
  const h = useHealth();
  const [step, setStep] = useState(0),
    [name, setName] = useState(""),
    [date, setDate] = useState(""),
    [cycle, setCycle] = useState("28"),
    [period, setPeriod] = useState("5"),
    [error, setError] = useState("");
  const finish = async () => {
    setError("");
    if (
      !validDate(date) ||
      date > today() ||
      !Number.isInteger(+cycle) ||
      +cycle < 15 ||
      +cycle > 90 ||
      !Number.isInteger(+period) ||
      +period < 1 ||
      +period > 15 ||
      +period >= +cycle
    ) {
      setError(h.t("invalid"));
      return;
    }
    try {
      const end = addDays(date, +period - 1);
      await h.savePeriod({
        ...metadata(),
        start: date,
        end: end < today() ? end : null,
      });
      await h.saveSettings({
        ...h.settings,
        name: name.trim(),
        cycleLength: +cycle,
        periodLength: +period,
        onboarded: true,
      });
      router.replace("/");
    } catch {
      setError(h.t("error"));
    }
  };
  return (
    <Page>
      <View style={{ height: 8 }} />
      <Brand />
      <Chips
        options={["en", "sw"] as const}
        selected={[h.settings.language]}
        label={(v) => (v === "en" ? "English" : "Kiswahili")}
        onSelect={(v) => {
          void h
            .saveSettings({ ...h.settings, language: v })
            .catch(() => setError(h.t("error")));
        }}
      />
      {step === 0 ? (
        <>
          <LinearGradient
            colors={[c.blush, c.background]}
            style={{
              borderRadius: 36,
              padding: 20,
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <Art name="heart" size={200} />
            <Copy kind="eyebrow" style={{ color: c.accent }}>
              {h.t("tagline")}
            </Copy>
          </LinearGradient>
          <Copy kind="title" style={{ fontSize: 40, lineHeight: 46 }}>
            {h.t("welcome")}
          </Copy>
          <Copy style={{ color: c.muted }}>{h.t("intro")}</Copy>
          <Button title={h.t("start")} chevron onPress={() => setStep(1)} />
          <Action
            title={h.t("demo")}
            secondary
            onPress={async () => {
              try {
                await h.demo();
                router.replace("/");
              } catch {
                setError(h.t("error"));
              }
            }}
          />
          <Copy kind="small" style={{ textAlign: "center", color: c.muted }}>
            {h.t("local")}
          </Copy>
        </>
      ) : step === 1 ? (
        <>
          <Copy kind="eyebrow" style={{ color: c.accent }}>
            01 / 02
          </Copy>
          <Copy kind="title">{h.t("setup")}</Copy>
          <Copy style={{ color: c.muted }}>{h.t("setupBody")}</Copy>
          <SoftCard>
            <Field
              label={h.t("name")}
              value={name}
              onChangeText={setName}
              placeholder={h.t("nameHint")}
            />
            <DateField
              label={h.t("lastPeriod")}
              value={date}
              onChangeText={setDate}
              placeholder={h.t("dateHint")}
              language={h.settings.language}
              maximumDate={new Date()}
            />
            <Copy kind="small" style={{ color: c.muted }}>
              {h.t("dateHelp")}
            </Copy>
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
          </SoftCard>
          <Button title={h.t("continue")} chevron onPress={() => setStep(2)} />
          <Button title={h.t("back")} secondary onPress={() => setStep(0)} />
        </>
      ) : (
        <>
          <Copy kind="eyebrow" style={{ color: c.accent }}>
            02 / 02
          </Copy>
          <View style={{ alignItems: "center" }}>
            <Art name="cloud" size={130} />
          </View>
          <Copy kind="title">{h.t("privacy")}</Copy>
          <SoftCard>
            <Copy>{h.t("privacyBody")}</Copy>
            <Copy>{h.t("privacyConsent")}</Copy>
          </SoftCard>
          <Copy kind="small" style={{ color: c.muted }}>
            {h.t("predictionNote")}
          </Copy>
          <Action title={h.t("privacyAccept")} onPress={finish} />
          <Button title={h.t("back")} secondary onPress={() => setStep(1)} />
        </>
      )}
      <Message text={error} />
    </Page>
  );
}
