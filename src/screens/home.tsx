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
  const cycleArt =
    cycle.phase === "menstrual"
      ? "period"
      : cycle.phase === "ovulatory"
        ? "ovulation"
        : cycle.phase === "follicular"
          ? "fertile"
          : "heart";
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
          colors={["#F8C7D5", "#FCE5EB"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 30,
            overflow: "hidden",
            minHeight: 292,
            padding: 20,
            ...shadows.float,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 210,
              height: 210,
              borderRadius: 105,
              backgroundColor: "rgba(255,255,255,0.24)",
              right: -58,
              top: -44,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              width: 112,
              height: 112,
              borderRadius: 56,
              backgroundColor: "rgba(255,255,255,0.18)",
              left: -36,
              bottom: 54,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View
              style={{
                borderRadius: radius.pill,
                backgroundColor: "rgba(255,255,255,0.62)",
                paddingHorizontal: 11,
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
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "rgba(255,255,255,0.72)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="arrow-forward" size={17} color={c.plum} />
            </Pressable>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              minHeight: 124,
              marginTop: 8,
            }}
          >
            <View style={{ flex: 1, gap: 2, zIndex: 2 }}>
              <Copy
                style={{
                  color: c.plum,
                  fontSize: 46,
                  lineHeight: 50,
                  fontWeight: "800",
                  letterSpacing: -1.7,
                }}
              >
                {cycle.day ? h.t("dayLabel", { count: cycle.day }) : h.t("cycleDay")}
              </Copy>
              <Copy style={{ color: c.ink, fontSize: 17, fontWeight: "800" }}>
                {h.t(phaseKey)}
              </Copy>
              <Copy style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>
                {periodEstimate}
              </Copy>
            </View>
            <View
              pointerEvents="none"
              style={{
                width: 118,
                height: 118,
                alignItems: "center",
                justifyContent: "center",
                marginRight: -4,
              }}
            >
              <Art name={cycleArt} size={112} />
            </View>
          </View>

          <View style={{ gap: 8, marginTop: 2 }}>
            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(91,42,74,0.10)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.max(progress * 100, cycle.day ? 3 : 0)}%`,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: c.plum,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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

          <View style={{ flexDirection: "row", gap: 9, marginTop: 14 }}>
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
                flex: 1,
                minHeight: 46,
                borderRadius: 15,
                backgroundColor: c.plum,
                paddingHorizontal: 13,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: pressed ? 0.82 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}
            >
              <Ionicons name="water" size={17} color={c.surface} />
              <Copy style={{ color: c.surface, fontWeight: "800", fontSize: 13 }}>
                {h.t(ongoingPeriod ? "endPeriod" : "startPeriod")}
              </Copy>
            </Pressable>
            <View
              style={{
                minHeight: 46,
                borderRadius: 15,
                backgroundColor: "rgba(255,255,255,0.66)",
                paddingHorizontal: 13,
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
