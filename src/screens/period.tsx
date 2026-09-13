import React, { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useHealth, metadata } from "../hooks/use-health";
import {
  Page,
  Copy,
  Field,
  Action,
  Button,
  Message,
  Art,
  DateField,
} from "../components/ui";
import { SectionHeading, SoftCard } from "../components/chrome";
import { validDate, today } from "../utils/dates";
import { validatePeriod } from "../services/cycle";
import { colors as c } from "../theme";

export default function PeriodScreen() {
  const h = useHealth(),
    params = useLocalSearchParams<{ date?: string }>(),
    existing = h.periods.find((p) => p.id === h.editingPeriod);
  const requestedDate =
    params.date && validDate(params.date) && params.date <= today()
      ? params.date
      : today();
  const [start, setStart] = useState(existing?.start ?? requestedDate),
    [end, setEnd] = useState(existing?.end ?? ""),
    [error, setError] = useState(""),
    [deleting, setDeleting] = useState(false);
  return (
    <Page>
      <View style={{ alignItems: "center", gap: 8, paddingVertical: 4 }}>
        <Art name="period" size={92} />
        <Copy kind="title" style={{ textAlign: "center" }}>
          {h.t(existing ? "editPeriod" : "addPeriod")}
        </Copy>
        <Copy style={{ color: c.muted, textAlign: "center" }}>
          {h.t("periodHelp")}
        </Copy>
      </View>
      <SoftCard tint={c.blush}>
        <SectionHeading
          icon="calendar-outline"
          tint={c.surface}
          title={h.t("periods")}
        />
        <DateField
          label={h.t("startDate")}
          value={start}
          onChangeText={setStart}
          placeholder={h.t("dateHint")}
          language={h.settings.language}
          maximumDate={new Date()}
        />
        {!!end && (
          <DateField
            label={h.t("endDate")}
            value={end}
            onChangeText={setEnd}
            placeholder={h.t("dateHint")}
            language={h.settings.language}
            minimumDate={new Date(`${start}T12:00:00`)}
            maximumDate={new Date()}
          />
        )}
        <Copy kind="small" style={{ color: c.muted }}>
          {h.t("dateHelp")}
        </Copy>
        {!end && (
          <Button
            secondary
            title={h.t("endToday")}
            onPress={() => setEnd(today())}
          />
        )}
        {!!end && !existing?.end && (
          <Button
            secondary
            title={h.t("ongoing")}
            onPress={() => setEnd("")}
          />
        )}
      </SoftCard>
      <Message text={error} />
      <Action
        title={h.t("save")}
        onPress={async () => {
          if (
            !validDate(start) ||
            (end && !validDate(end)) ||
            start > today() ||
            end > today() ||
            (end && end < start)
          ) {
            setError(h.t("invalid"));
            return;
          }
          const p = { ...(existing ?? metadata()), start, end: end || null };
          if (!validatePeriod(p, h.periods, today())) {
            setError(h.t("overlap"));
            return;
          }
          try {
            await h.savePeriod(p);
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
      {deleting && existing && (
        <SoftCard tint={c.blush}>
          <SectionHeading
            icon="alert-circle-outline"
            tint={c.surface}
            title={h.t("deletePeriod")}
          />
          <Copy>
            {h.t("deletePeriod")} {h.t("confirmDelete")}
          </Copy>
          <Action
            title={h.t("delete")}
            onPress={async () => {
              try {
                await h.deletePeriod(existing.id);
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
