import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useHealth } from "../hooks/use-health";
import { Page, Copy, Button, Row, Art } from "../components/ui";
import { AppHeader, SoftCard, IconBubble } from "../components/chrome";
import { today, addDays, formatDate } from "../utils/dates";
import { calculateCycle } from "../services/cycle";
import { colors as c } from "../theme";

export default function Calendar() {
  const h = useHealth(),
    now = today();
  const [month, setMonth] = useState(now.slice(0, 7) + "-01"),
    [selected, setSelected] = useState(now);
  const d = new Date(month + "T12:00:00"),
    offset = (d.getDay() + 6) % 7;
  const first = addDays(month, -offset),
    days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const cycle = calculateCycle(h.periods, h.settings, now),
    log = h.logs.find((l) => l.date === selected),
    period = h.periods.find(
      (p) => selected >= p.start && selected <= (p.end ?? now),
    );
  const move = (n: number) => {
    const date = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
    setMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`,
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppHeader right="bell" />
      <Page>
        <SoftCard>
          <Row>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={h.t("monthPrevious")}
              hitSlop={8}
              onPress={() => move(-1)}
              style={{ padding: 8 }}
            >
              <Ionicons name="chevron-back" size={18} color={c.plum} />
            </Pressable>
            <Copy
              kind="heading"
              style={{ flex: 1, textAlign: "center", fontSize: 17 }}
            >
              {d.toLocaleDateString(
                h.settings.language === "sw" ? "sw-KE" : "en-KE",
                { month: "long", year: "numeric" },
              )}
            </Copy>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={h.t("monthNext")}
              hitSlop={8}
              onPress={() => move(1)}
              style={{ padding: 8 }}
            >
              <Ionicons name="chevron-forward" size={18} color={c.plum} />
            </Pressable>
          </Row>
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            {Array.from({ length: 7 }, (_, i) => (
              <Copy
                key={i}
                kind="small"
                style={{
                  width: "14.285%",
                  textAlign: "center",
                  color: c.muted,
                  fontWeight: "600",
                }}
              >
                {new Date(`2026-09-${14 + i}T12:00:00`).toLocaleDateString(
                  h.settings.language === "sw" ? "sw-KE" : "en-KE",
                  { weekday: "short" },
                ).slice(0, 3)}
              </Copy>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {days.map((day) => {
              const recorded = h.periods.some(
                  (p) => day >= p.start && day <= (p.end ?? now),
                ),
                predicted =
                  !recorded &&
                  cycle.next &&
                  day >= cycle.next &&
                  day < addDays(cycle.next, cycle.periodLength) &&
                  day >= now,
                fertile =
                  h.settings.showFertility &&
                  !recorded &&
                  cycle.fertileStart &&
                  cycle.fertileEnd &&
                  day >= cycle.fertileStart &&
                  day <= cycle.fertileEnd;
              const currentMonth = day.slice(0, 7) === month.slice(0, 7);
              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatDate(day, h.settings.language, true)}${recorded ? `, ${h.t("recorded")}` : predicted ? `, ${h.t("predicted")}` : ""}`}
                  accessibilityState={{ selected: day === selected }}
                  onPress={() => setSelected(day)}
                  style={{ width: "14.285%", minHeight: 42, paddingVertical: 3 }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignSelf: "center",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        day === selected
                          ? c.plum
                          : recorded
                            ? c.rose
                            : predicted
                              ? c.blush
                              : fertile
                                ? c.sage
                                : "transparent",
                      opacity: currentMonth ? 1 : 0.28,
                    }}
                  >
                    <Copy
                      style={{
                        color: day === selected ? "white" : c.ink,
                        fontSize: 13,
                        fontWeight: day === selected || recorded ? "700" : "500",
                      }}
                    >
                      {Number(day.slice(-2))}
                    </Copy>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SoftCard>

        <SoftCard>
          <Row>
            <Art name="droplet" size={48} />
            <View style={{ flex: 1 }}>
              <Copy kind="small" style={{ color: c.muted, fontWeight: "600" }}>
                {h.t("nextPeriod")}
              </Copy>
              <Copy kind="heading" style={{ color: c.title, fontSize: 22 }}>
                {cycle.remaining === null
                  ? "—"
                  : cycle.remaining < 0
                    ? h.t("pastEstimate")
                    : cycle.remaining === 0
                      ? h.t("due")
                      : h.t("countDays", { count: cycle.remaining })}
              </Copy>
              <Copy kind="small" style={{ color: c.muted }}>
                {cycle.next
                  ? formatDate(cycle.next, h.settings.language, true)
                  : h.t("unknown")}
              </Copy>
            </View>
          </Row>
        </SoftCard>

        {h.settings.showFertility && (
          <SoftCard>
            <Row>
              <Art name="fertile" size={46} />
              <View style={{ flex: 1 }}>
                <Copy kind="small" style={{ color: c.muted, fontWeight: "600" }}>
                  {h.t("fertileWindow")}
                </Copy>
                <Copy kind="heading" style={{ fontSize: 18 }}>
                  {cycle.fertileStart && cycle.fertileEnd
                    ? `${formatDate(cycle.fertileStart, h.settings.language)} – ${formatDate(cycle.fertileEnd, h.settings.language)}`
                    : "—"}
                </Copy>
              </View>
            </Row>
          </SoftCard>
        )}

        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SoftCard onPress={() => router.push("/history")}>
              <IconBubble name="heart-outline" tint={c.blush} color={c.accent} />
              <Copy style={{ fontWeight: "700" }}>{h.t("symptoms")}</Copy>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("symptomsTeaser")}
              </Copy>
            </SoftCard>
          </View>
          <View style={{ flex: 1 }}>
            <SoftCard onPress={() => router.push("/(tabs)/insights")}>
              <IconBubble name="sparkles-outline" tint={c.lavender} />
              <Copy style={{ fontWeight: "700" }}>{h.t("insights")}</Copy>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("insightsTeaser")}
              </Copy>
            </SoftCard>
          </View>
        </View>

        <SoftCard tint={c.banner}>
          <Copy kind="heading" style={{ color: "white", fontSize: 18 }}>
            {h.t("bannerLine")}
          </Copy>
        </SoftCard>

        <SoftCard>
          <Copy kind="small" style={{ color: c.muted, fontWeight: "700" }}>
            {h.t("selectedDay")}
          </Copy>
          <Copy kind="heading" style={{ fontSize: 18 }}>
            {formatDate(selected, h.settings.language, true)}
          </Copy>
          <Button
            secondary
            title={h.t("dayDetails")}
            onPress={() =>
              router.push({ pathname: "/day", params: { date: selected } })
            }
          />
          {period && (
            <Button
              secondary
              title={h.t("editPeriod")}
              onPress={() => {
                h.setEditingPeriod(period.id);
                router.push("/period");
              }}
            />
          )}
          {!period && selected <= now && (
            <Button
              secondary
              title={h.t("startPeriod")}
              onPress={() => {
                h.setEditingPeriod(null);
                router.push({ pathname: "/period", params: { date: selected } });
              }}
            />
          )}
          {log ? (
            <Copy style={{ color: c.muted }}>
              {h.t("flow")}: {h.t(log.flow)}
              {log.moods.length ? ` · ${log.moods.map((m) => h.t(m)).join(", ")}` : ""}
            </Copy>
          ) : (
            <Copy style={{ color: c.muted }}>{h.t("noDay")}</Copy>
          )}
          {selected <= now && (
            <Button
              title={h.t(log ? "edit" : "logToday")}
              chevron
              onPress={() => {
                h.setEditingDate(selected);
                router.push("/check-in");
              }}
            />
          )}
        </SoftCard>
      </Page>
    </View>
  );
}
