import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHealth } from "../hooks/use-health";
import { calculateCycle } from "../services/cycle";
import { today } from "../utils/dates";
import { Copy, Message, Page } from "../components/ui";
import { Brand } from "../components/chrome";
import { Face } from "../components/faces";
import { colors as c, radius } from "../theme";
import { Mood } from "../types";

const moods: Mood[] = ["happy", "calm", "tired", "irritable"];
const energyLabels = [
  "energyVeryLow",
  "energyLow",
  "energyOkay",
  "energyGood",
  "energyHigh",
] as const;

function HomeHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 12),
        paddingHorizontal: 20,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: c.background,
      }}
    >
      <Brand />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="You"
        onPress={() => router.push("/(tabs)/you")}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <Ionicons name="person-outline" size={21} color={c.plum} />
      </Pressable>
    </View>
  );
}

function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Copy kind="heading">{title}</Copy>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        hitSlop={8}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          opacity: pressed ? 0.55 : 1,
          paddingVertical: 4,
        })}
      >
        <Copy style={{ color: c.muted, fontSize: 14, fontWeight: "600" }}>
          {action}
        </Copy>
        <Ionicons name="chevron-forward" size={16} color={c.muted} />
      </Pressable>
    </View>
  );
}

function QuickLogCard({
  icon,
  title,
  value,
  tint,
  iconTint,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  tint: string;
  iconTint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${value}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        minHeight: 116,
        borderRadius: radius.md,
        padding: 13,
        justifyContent: "space-between",
        backgroundColor: tint,
        borderWidth: 1,
        borderColor: c.line,
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: iconTint,
        }}
      >
        <Ionicons name={icon} size={19} color={c.plum} />
      </View>
      <View style={{ gap: 1 }}>
        <Copy
          numberOfLines={1}
          style={{ fontSize: 14, lineHeight: 19, fontWeight: "700" }}
        >
          {title}
        </Copy>
        <Copy
          numberOfLines={1}
          style={{ color: c.muted, fontSize: 12, lineHeight: 17 }}
        >
          {value}
        </Copy>
      </View>
    </Pressable>
  );
}

export default function Home() {
  const h = useHealth();
  const [periodMessage, setPeriodMessage] = useState("");
  const now = today();
  const cycle = calculateCycle(h.periods, h.settings, now);
  const log = h.logs.find((entry) => entry.date === now);
  const selectedMood = log?.moods[0];
  const ongoingPeriod = h.periods.find((entry) => entry.end === null);
  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? "goodMorning" : hour < 18 ? "goodAfternoon" : "goodEvening";
  const progress = cycle.day
    ? Math.min(1, Math.max(0, cycle.day / Math.max(cycle.average, 1)))
    : 0;
  const phaseKey =
    cycle.phase === "menstrual" ||
    cycle.phase === "follicular" ||
    cycle.phase === "ovulatory" ||
    cycle.phase === "luteal"
      ? cycle.phase
      : "unknown";
  const insightKey =
    cycle.phase === "menstrual"
      ? "insightMenstrual"
      : cycle.phase === "follicular"
        ? "insightFollicular"
        : cycle.phase === "ovulatory"
          ? "insightOvulatory"
          : cycle.phase === "luteal"
            ? "insightLuteal"
            : "insightUnknown";
  const periodEstimate =
    cycle.remaining === null
      ? h.t("periodEstimateUnknown")
      : cycle.remaining <= 0
        ? h.t("periodEstimateToday")
        : h.t("periodEstimate", { count: cycle.remaining });
  const openLog = (mood?: Mood) => {
    h.setEditingDate(now);
    router.push(mood ? { pathname: "/check-in", params: { mood } } : "/check-in");
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <HomeHeader />
      <Page backgroundColor={c.background}>
        <View style={{ gap: 3, paddingTop: 4 }}>
          <Copy
            kind="heading"
            style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.5 }}
          >
            {h.t(greetingKey)}
          </Copy>
          <Copy style={{ color: c.muted, fontSize: 15 }}>
            {new Date(`${now}T12:00:00`).toLocaleDateString(
              h.settings.language === "sw" ? "sw-KE" : "en-KE",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </Copy>
        </View>

        <View
          style={{
            borderRadius: radius.lg,
            padding: 20,
            gap: 6,
            backgroundColor: c.blush,
            borderWidth: 1,
            borderColor: c.line,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Copy kind="eyebrow" style={{ color: c.title, textTransform: "uppercase" }}>
              {h.t("yourCycle")}
            </Copy>
            <View
              style={{
                borderRadius: radius.pill,
                backgroundColor: c.surface,
                paddingHorizontal: 11,
                paddingVertical: 5,
              }}
            >
              <Copy style={{ color: c.plum, fontSize: 13, fontWeight: "600" }}>
                {h.t("cycleProgress", {
                  day: cycle.day ?? "—",
                  total: cycle.average,
                })}
              </Copy>
            </View>
          </View>
          <Copy
            kind="heading"
            style={{ color: c.plum, fontSize: 30, lineHeight: 36, marginTop: 4 }}
          >
            {cycle.day ? h.t("dayLabel", { count: cycle.day }) : h.t("cycleDay")}
          </Copy>
          <Copy style={{ color: c.ink, fontSize: 16, fontWeight: "600" }}>
            {h.t(phaseKey)}
          </Copy>
          <Copy style={{ color: c.muted, fontSize: 14 }}>{periodEstimate}</Copy>
          <View style={{ paddingTop: 14, gap: 8 }}>
            <View
              style={{
                height: 7,
                borderRadius: 4,
                backgroundColor: "rgba(91,42,74,0.10)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${progress * 100}%`,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: c.accent,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("menstrual")}
              </Copy>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("ovulatory")}
              </Copy>
              <Copy kind="small" style={{ color: c.muted }}>
                {h.t("nextPeriod")}
              </Copy>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void (async () => {
                setPeriodMessage("");
                if (!ongoingPeriod) {
                  h.setEditingPeriod(null);
                  router.push({ pathname: "/period", params: { date: now } });
                  return;
                }
                try {
                  await h.savePeriod({ ...ongoingPeriod, end: now });
                  setPeriodMessage(h.t("periodSaved"));
                } catch {
                  setPeriodMessage(h.t("error"));
                }
              })();
            }}
            style={({ pressed }) => ({
              minHeight: 44,
              borderRadius: radius.sm,
              borderCurve: "continuous",
              backgroundColor: c.surface,
              paddingHorizontal: 13,
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              opacity: pressed ? 0.7 : 1,
              marginTop: 8,
            })}
          >
            <Ionicons name="water-outline" size={18} color={c.accent} />
            <Copy style={{ flex: 1, color: c.plum, fontWeight: "700", fontSize: 14 }}>
              {h.t(ongoingPeriod ? "endPeriod" : "startPeriod")}
            </Copy>
            <Ionicons name="chevron-forward" size={16} color={c.muted} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/cycle")}
            hitSlop={6}
            style={({ pressed }) => ({
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
              opacity: pressed ? 0.55 : 1,
              paddingTop: 4,
            })}
          >
            <Copy style={{ color: c.muted, fontSize: 13, fontWeight: "600" }}>
              {h.t("cycleDetails")}
            </Copy>
            <Ionicons name="chevron-forward" size={15} color={c.muted} />
          </Pressable>
        </View>

        <Message
          text={periodMessage}
          tone={periodMessage === h.t("periodSaved") ? "success" : "error"}
        />

        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: radius.lg,
            padding: 18,
            gap: 17,
            borderWidth: 1,
            borderColor: c.line,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Copy kind="heading">{h.t("howFeel")}</Copy>
              <Copy style={{ color: c.muted, fontSize: 14 }}>{h.t("trackMood")}</Copy>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={h.t("addMore")}
              onPress={() => openLog()}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: c.lavender,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="add" size={21} color={c.plum} />
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {moods.map((mood) => {
              const selected = selectedMood === mood;
              return (
                <Pressable
                  key={mood}
                  accessibilityRole="button"
                  accessibilityLabel={h.t(mood)}
                  accessibilityState={{ selected }}
                  onPress={() => openLog(mood)}
                  style={({ pressed }) => ({
                    width: "24%",
                    minWidth: 0,
                    alignItems: "center",
                    gap: 6,
                    opacity: pressed ? 0.65 : 1,
                  })}
                >
                  <View
                    style={{
                      padding: 3,
                      borderRadius: radius.pill,
                      borderWidth: 2,
                      borderColor: selected ? c.accent : "transparent",
                    }}
                  >
                    <Face mood={mood} size={54} />
                    {selected && (
                      <View
                        style={{
                          position: "absolute",
                          right: -4,
                          top: -4,
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: c.accent,
                          borderWidth: 2,
                          borderColor: c.surface,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="checkmark" size={13} color={c.surface} />
                      </View>
                    )}
                  </View>
                  <Copy
                    numberOfLines={1}
                    style={{
                      fontWeight: selected ? "700" : "500",
                      fontSize: 12,
                      lineHeight: 17,
                      color: selected ? c.plum : c.muted,
                    }}
                  >
                    {h.t(mood)}
                  </Copy>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => openLog()}
          style={({ pressed }) => ({
            minHeight: 54,
            borderRadius: radius.md,
            backgroundColor: log ? c.sage : c.surface,
            borderWidth: 1,
            borderColor: log ? "#CFE7D7" : c.line,
            paddingHorizontal: 15,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: log ? c.green : c.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={log ? "checkmark" : "add"} size={17} color={c.surface} />
          </View>
          <Copy
            style={{
              flex: 1,
              color: log ? c.green : c.plum,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {h.t(log ? "checkInSaved" : "completeCheckIn")}
          </Copy>
          <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </Pressable>

        <View style={{ gap: 11 }}>
          <SectionHeader
            title={h.t("quickLog")}
            action={h.t("viewAll")}
            onPress={() => openLog()}
          />
          <View style={{ flexDirection: "row", gap: 9 }}>
            <QuickLogCard
              icon="flash-outline"
              title={h.t("symptoms")}
              value={
                log
                  ? h.t("symptomsLogged", { count: log.symptoms.length })
                  : h.t("notRecorded")
              }
              tint={c.lavenderSoft}
              iconTint={c.lavender}
              onPress={() => openLog()}
            />
            <QuickLogCard
              icon="bar-chart-outline"
              title={h.t("energy")}
              value={log ? h.t(energyLabels[log.energy - 1]) : h.t("notRecorded")}
              tint={c.peachSoft}
              iconTint={c.peach}
              onPress={() => openLog()}
            />
            <QuickLogCard
              icon="happy-outline"
              title={h.t("moods")}
              value={selectedMood ? h.t(selectedMood) : h.t("notRecorded")}
              tint={c.blush}
              iconTint={c.petal}
              onPress={() => openLog(selectedMood)}
            />
          </View>
        </View>

        <View style={{ gap: 11 }}>
          <SectionHeader
            title={h.t("todayInsight")}
            action={h.t("seeMore")}
            onPress={() => router.push("/(tabs)/insights")}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/insights")}
            style={({ pressed }) => ({
              minHeight: 94,
              borderRadius: radius.md,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: c.line,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: c.peach,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="bulb-outline" size={22} color={c.plum} />
            </View>
            <Copy style={{ flex: 1, color: c.muted, fontSize: 14, lineHeight: 20 }}>
              {h.t(insightKey)}
            </Copy>
            <Ionicons name="chevron-forward" size={19} color={c.muted} />
          </Pressable>
        </View>

        {h.settings.demo && (
          <Copy kind="small" style={{ textAlign: "center", color: c.plum }}>
            {h.t("demoBadge")}
          </Copy>
        )}
      </Page>
    </View>
  );
}
