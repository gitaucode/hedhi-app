import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHealth } from "../hooks/use-health";
import { calculateCycle } from "../services/cycle";
import { today } from "../utils/dates";
import { Art, Copy, Message, Page } from "../components/ui";
import { Brand } from "../components/chrome";
import { Face } from "../components/faces";
import { colors as c, radius, shadows } from "../theme";
import { Mood } from "../types";

const moods: Mood[] = ["happy", "calm", "tired", "irritable"];
const energyLabels = [
  "energyVeryLow",
  "energyLow",
  "energyOkay",
  "energyGood",
  "energyHigh",
] as const;

const phaseColors = {
  menstrual: "#E96D94",
  follicular: "#F3AEC4",
  ovulatory: "#CDB9EA",
  luteal: "#F2C5B5",
} as const;

type ChartPhase = keyof typeof phaseColors;

function chartPhase(day: number, average: number, periodLength: number): ChartPhase {
  const ovulationDay = Math.max(periodLength + 2, average - 14);
  if (day <= periodLength) return "menstrual";
  if (day < ovulationDay - 1) return "follicular";
  if (day <= ovulationDay + 1) return "ovulatory";
  return "luteal";
}

function HomeHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: Math.max(insets.top, 12),
        paddingHorizontal: 22,
        paddingBottom: 8,
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
          backgroundColor: c.blush,
          borderWidth: 1,
          borderColor: c.line,
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Ionicons name="person" size={18} color={c.plum} />
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
      <Copy kind="heading" style={{ fontSize: 19 }}>
        {title}
      </Copy>
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
        <Copy style={{ color: c.muted, fontSize: 13, fontWeight: "700" }}>
          {action}
        </Copy>
        <Ionicons name="chevron-forward" size={15} color={c.muted} />
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
        minHeight: 132,
        borderRadius: 22,
        padding: 14,
        justifyContent: "space-between",
        backgroundColor: tint,
        opacity: pressed ? 0.78 : 1,
        transform: [{ scale: pressed ? 0.975 : 1 }],
        ...shadows.card,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: iconTint,
          }}
        >
          <Ionicons name={icon} size={20} color={c.plum} />
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.72)",
          }}
        >
          <Ionicons name="add" size={15} color={c.plum} />
        </View>
      </View>
      <View style={{ gap: 2 }}>
        <Copy
          numberOfLines={1}
          style={{ fontSize: 14, lineHeight: 19, fontWeight: "800", color: c.plum }}
        >
          {title}
        </Copy>
        <Copy
          numberOfLines={2}
          style={{ color: c.muted, fontSize: 12, lineHeight: 16 }}
        >
          {value}
        </Copy>
      </View>
    </Pressable>
  );
}

function CycleChart({
  day,
  average,
  periodLength,
  phaseLabel,
  activePhase,
  periodEstimate,
  todayLabel,
  cycleDayLabel,
  labels,
}: {
  day: number | null;
  average: number;
  periodLength: number;
  phaseLabel: string;
  activePhase: ChartPhase | null;
  periodEstimate: string;
  todayLabel: string;
  cycleDayLabel: string;
  labels: Record<ChartPhase, string>;
}) {
  const size = 304;
  const center = size / 2;
  const ringRadius = 85;
  const segmentCount = Math.min(40, Math.max(21, Math.round(average)));
  const circumferencePerSegment = (2 * Math.PI * ringRadius) / segmentCount;
  const segmentWidth = Math.max(8, Math.min(15, circumferencePerSegment * 0.66));
  const segmentHeight = 24;
  const currentDay = day ? Math.min(Math.max(day, 1), average) : null;
  const currentAngle = currentDay
    ? ((currentDay - 0.5) / average) * Math.PI * 2 - Math.PI / 2
    : -Math.PI / 2;
  const markerX = center + ringRadius * Math.cos(currentAngle) - 10;
  const markerY = center + ringRadius * Math.sin(currentAngle) - 10;
  const todayLeft = Math.min(size - 42, markerX + 21);
  const todayTop = Math.min(size - 18, Math.max(4, markerY + 3));

  const callouts: Record<
    ChartPhase,
    {
      label: { left: number; top: number; width: number; align: "left" | "center" | "right" };
      line: { left: number; top: number; width: number; height: number };
      dot: { left: number; top: number };
    }
  > = {
    menstrual: {
      label: { left: 235, top: 58, width: 66, align: "left" },
      line: { left: 216, top: 82, width: 18, height: 1 },
      dot: { left: 212, top: 80 },
    },
    follicular: {
      label: { left: 239, top: 139, width: 63, align: "left" },
      line: { left: 222, top: 159, width: 16, height: 1 },
      dot: { left: 218, top: 157 },
    },
    ovulatory: {
      label: { left: 105, top: 271, width: 94, align: "center" },
      line: { left: 151, top: 244, width: 1, height: 22 },
      dot: { left: 149, top: 240 },
    },
    luteal: {
      label: { left: 2, top: 153, width: 65, align: "right" },
      line: { left: 68, top: 171, width: 17, height: 1 },
      dot: { left: 83, top: 169 },
    },
  };

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size }}>
        {Array.from({ length: segmentCount }, (_, index) => {
          const representedDay = Math.min(
            average,
            Math.max(1, Math.round(((index + 0.5) / segmentCount) * average)),
          );
          const angle = (index / segmentCount) * Math.PI * 2 - Math.PI / 2;
          const x = center + ringRadius * Math.cos(angle) - segmentWidth / 2;
          const y = center + ringRadius * Math.sin(angle) - segmentHeight / 2;
          const phase = chartPhase(representedDay, average, periodLength);
          const angleDegrees = (angle * 180) / Math.PI + 90;
          return (
            <View
              key={index}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: segmentWidth,
                height: segmentHeight,
                borderRadius: segmentWidth / 2,
                backgroundColor: phaseColors[phase],
                opacity: activePhase === null || activePhase === phase ? 1 : 0.68,
                transform: [{ rotate: `${angleDegrees}deg` }],
              }}
            />
          );
        })}

        {(Object.keys(callouts) as ChartPhase[]).map((phase) => {
          const callout = callouts[phase];
          const selected = activePhase === phase;
          return (
            <View key={phase} pointerEvents="none">
              <View
                style={{
                  position: "absolute",
                  left: callout.line.left,
                  top: callout.line.top,
                  width: callout.line.width,
                  height: callout.line.height,
                  backgroundColor: phaseColors[phase],
                  opacity: selected ? 1 : 0.72,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  left: callout.dot.left,
                  top: callout.dot.top,
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: phaseColors[phase],
                }}
              />
              <Copy
                numberOfLines={2}
                style={{
                  position: "absolute",
                  left: callout.label.left,
                  top: callout.label.top,
                  width: callout.label.width,
                  color: selected ? c.plum : c.muted,
                  fontSize: selected ? 10.5 : 10,
                  lineHeight: 12,
                  textAlign: callout.label.align,
                  fontWeight: selected ? "800" : "600",
                }}
              >
                {labels[phase]}
              </Copy>
            </View>
          );
        })}

        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: center - 65,
            top: center - 65,
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: "rgba(255,255,255,0.80)",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.95)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 13,
            ...shadows.card,
          }}
        >
          <Copy style={{ color: c.muted, fontSize: 11, fontWeight: "700" }}>
            {cycleDayLabel}
          </Copy>
          <Copy
            style={{
              color: c.plum,
              fontSize: 45,
              lineHeight: 48,
              fontWeight: "800",
              letterSpacing: -1.8,
            }}
          >
            {day ?? "—"}
          </Copy>
          <Copy
            numberOfLines={1}
            style={{ color: c.plum, fontSize: 13, fontWeight: "800" }}
          >
            {phaseLabel}
          </Copy>
          <View
            style={{
              width: 26,
              height: 2,
              borderRadius: 1,
              backgroundColor: c.line,
              marginVertical: 5,
            }}
          />
          <Copy
            numberOfLines={2}
            style={{
              color: c.muted,
              fontSize: 10,
              lineHeight: 13,
              textAlign: "center",
            }}
          >
            {periodEstimate}
          </Copy>
        </View>

        {currentDay && (
          <>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: markerX,
                top: markerY,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: c.accent,
                borderWidth: 4,
                borderColor: c.surface,
                ...shadows.float,
              }}
            />
            <Copy
              pointerEvents="none"
              style={{
                position: "absolute",
                left: todayLeft,
                top: todayTop,
                color: c.plum,
                fontSize: 10,
                lineHeight: 13,
                fontWeight: "800",
              }}
            >
              {todayLabel}
            </Copy>
          </>
        )}
      </View>
    </View>
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
  const phaseKey =
    cycle.phase === "menstrual" ||
    cycle.phase === "follicular" ||
    cycle.phase === "ovulatory" ||
    cycle.phase === "luteal"
      ? cycle.phase
      : "unknown";
  const activePhase: ChartPhase | null =
    cycle.phase === "menstrual" ||
    cycle.phase === "follicular" ||
    cycle.phase === "ovulatory" ||
    cycle.phase === "luteal"
      ? cycle.phase
      : null;
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
  const togglePeriod = () => {
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
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <HomeHeader />
      <Page backgroundColor={c.background}>
        <View style={{ gap: 4, paddingTop: 2, paddingBottom: 2 }}>
          <Copy
            kind="heading"
            style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.7, color: c.plum }}
          >
            {h.t(greetingKey)}
          </Copy>
          <Copy style={{ color: c.muted, fontSize: 14 }}>
            {new Date(`${now}T12:00:00`).toLocaleDateString(
              h.settings.language === "sw" ? "sw-KE" : "en-KE",
              { weekday: "long", day: "numeric", month: "long" },
            )}
          </Copy>
        </View>

        <LinearGradient
          colors={["#F8CCD8", "#FDE8EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 30,
            overflow: "hidden",
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 18,
            ...shadows.float,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 230,
              height: 230,
              borderRadius: 115,
              backgroundColor: "rgba(255,255,255,0.18)",
              right: -80,
              top: -52,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 2,
            }}
          >
            <View
              style={{
                borderRadius: radius.pill,
                backgroundColor: "rgba(255,255,255,0.66)",
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <Copy
                kind="eyebrow"
                style={{ color: c.plum, textTransform: "uppercase", letterSpacing: 0.8 }}
              >
                {h.t("yourCycle")}
              </Copy>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={h.t("cycleDetails")}
              onPress={() => router.push("/cycle")}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.76)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="arrow-forward" size={18} color={c.plum} />
            </Pressable>
          </View>

          <CycleChart
            day={cycle.day}
            average={cycle.average}
            periodLength={cycle.periodLength}
            phaseLabel={h.t(phaseKey)}
            activePhase={activePhase}
            periodEstimate={periodEstimate}
            todayLabel={h.t("todayLabel")}
            cycleDayLabel={h.t("cycleDay")}
            labels={{
              menstrual: h.t("menstrual"),
              follicular: h.t("follicular"),
              ovulatory: h.t("ovulatory"),
              luteal: h.t("luteal"),
            }}
          />

          <View style={{ flexDirection: "row", gap: 9, marginTop: 6 }}>
            <Pressable
              accessibilityRole="button"
              onPress={togglePeriod}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 50,
                borderRadius: 17,
                backgroundColor: c.plum,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
            >
              <Ionicons name="water" size={18} color={c.surface} />
              <Copy style={{ color: c.surface, fontWeight: "800", fontSize: 14 }}>
                {h.t(ongoingPeriod ? "endPeriod" : "startPeriod")}
              </Copy>
            </Pressable>
            <View
              style={{
                minHeight: 50,
                borderRadius: 17,
                backgroundColor: "rgba(255,255,255,0.72)",
                paddingHorizontal: 14,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Copy style={{ color: c.plum, fontSize: 12, fontWeight: "800" }}>
                {h.t("cycleProgress", { day: cycle.day ?? "—", total: cycle.average })}
              </Copy>
            </View>
          </View>
        </LinearGradient>

        <Message
          text={periodMessage}
          tone={periodMessage === h.t("periodSaved") ? "success" : "error"}
        />

        <View
          style={{
            backgroundColor: c.surface,
            borderRadius: 26,
            padding: 18,
            gap: 18,
            ...shadows.card,
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
            <View style={{ flex: 1, gap: 3 }}>
              <Copy kind="heading" style={{ fontSize: 19 }}>
                {h.t("howFeel")}
              </Copy>
              <Copy style={{ color: c.muted, fontSize: 13 }}>{h.t("trackMood")}</Copy>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={h.t("addMore")}
              onPress={() => openLog()}
              hitSlop={6}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: c.lavender,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="add" size={20} color={c.plum} />
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
                    gap: 7,
                    opacity: pressed ? 0.65 : 1,
                    transform: [{ translateY: selected ? -2 : 0 }],
                  })}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? c.blush : c.mist,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? c.accent : c.line,
                    }}
                  >
                    <Face mood={mood} size={49} />
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
                      fontWeight: selected ? "800" : "600",
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
            minHeight: 58,
            borderRadius: 19,
            backgroundColor: log ? c.sage : c.plum,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 11,
            opacity: pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
            ...shadows.card,
          })}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: log ? c.green : "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name={log ? "checkmark" : "add"} size={18} color={c.surface} />
          </View>
          <Copy
            style={{
              flex: 1,
              color: log ? c.green : c.surface,
              fontSize: 14,
              fontWeight: "800",
            }}
          >
            {h.t(log ? "checkInSaved" : "completeCheckIn")}
          </Copy>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={log ? c.green : c.surface}
          />
        </Pressable>

        <View style={{ gap: 12 }}>
          <SectionHeader
            title={h.t("quickLog")}
            action={h.t("viewAll")}
            onPress={() => openLog()}
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <QuickLogCard
              icon="sparkles-outline"
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
              icon="flash-outline"
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

        <View style={{ gap: 12 }}>
          <SectionHeader
            title={h.t("todayInsight")}
            action={h.t("seeMore")}
            onPress={() => router.push("/(tabs)/insights")}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/insights")}
            style={({ pressed }) => ({
              minHeight: 116,
              borderRadius: 24,
              backgroundColor: c.peachSoft,
              padding: 17,
              flexDirection: "row",
              alignItems: "center",
              gap: 13,
              opacity: pressed ? 0.78 : 1,
              transform: [{ scale: pressed ? 0.985 : 1 }],
              ...shadows.card,
            })}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.62)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Art name="cloud" size={64} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Copy style={{ color: c.plum, fontSize: 13, fontWeight: "800" }}>
                {h.t(phaseKey)}
              </Copy>
              <Copy style={{ color: c.ink, fontSize: 13, lineHeight: 19 }}>
                {h.t(insightKey)}
              </Copy>
            </View>
            <Ionicons name="arrow-forward" size={18} color={c.plum} />
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
