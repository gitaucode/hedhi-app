import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as c, radius, shadows } from "../theme";
import { Copy } from "./ui";

export function Brand() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Copy
        kind="eyebrow"
        style={{ letterSpacing: 3, fontSize: 13, color: c.plum }}
      >
        HEDHI
      </Copy>
      <Ionicons name="heart" size={14} color={c.accent} />
    </View>
  );
}

export function AppHeader({
  right = "profile",
}: {
  right?: "profile" | "bell" | "none";
}) {
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
      }}
    >
      <Brand />
      {right === "none" ? (
        <View style={{ width: 36 }} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={right === "bell" ? "Reminders" : "You"}
          hitSlop={8}
          onPress={() =>
            router.push(right === "bell" ? "/(tabs)/you" : "/(tabs)/you")
          }
          style={({ pressed }) => ({
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.line,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons
            name={right === "bell" ? "notifications-outline" : "person-outline"}
            size={18}
            color={c.plum}
          />
        </Pressable>
      )}
    </View>
  );
}

const tabs = [
  { name: "index", icon: "home-outline", iconOn: "home", key: 0 },
  { name: "insights", icon: "stats-chart-outline", iconOn: "stats-chart", key: 1 },
  { name: "calendar", icon: "calendar-outline", iconOn: "calendar", key: 2 },
  { name: "you", icon: "person-outline", iconOn: "person", key: 3 },
] as const;

export function Dock({
  state,
  descriptors,
  navigation,
}: {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: { navigate: (name: string) => void };
}) {
  const insets = useSafeAreaInsets();
  const left = tabs.slice(0, 2);
  const right = tabs.slice(2);
  const item = (name: (typeof tabs)[number]["name"], icon: string, iconOn: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return null;
    const index = state.routes.indexOf(route);
    const focused = state.index === index;
    const option = descriptors[route.key].options;
    const raw = option.title ?? name;
    return (
      <Pressable
        key={name}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onPress={() => navigation.navigate(name)}
        style={({ pressed }) => ({
          flex: 1,
          alignItems: "center",
          gap: 3,
          paddingVertical: 7,
          opacity: pressed ? 0.65 : 1,
        })}
      >
        <View
          style={{
            minWidth: 40,
            height: 32,
            paddingHorizontal: 10,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: focused ? c.blush : "transparent",
          }}
        >
          <Ionicons
            name={(focused ? iconOn : icon) as keyof typeof Ionicons.glyphMap}
            size={21}
            color={focused ? c.plum : c.muted}
          />
        </View>
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: focused ? "700" : "600",
            color: focused ? c.plum : c.muted,
          }}
        >
          {String(raw)}
        </Text>
      </Pressable>
    );
  };
  return (
    <View
      style={{
        backgroundColor: c.background,
        paddingHorizontal: 14,
        paddingTop: 9,
        paddingBottom: Math.max(insets.bottom, 8) + 4,
      }}
    >
      <View
        style={{
          minHeight: 70,
          borderRadius: 26,
          backgroundColor: c.surface,
          flexDirection: "row",
          alignItems: "flex-end",
          paddingHorizontal: 6,
          paddingTop: 4,
          paddingBottom: 3,
          ...shadows.float,
        }}
      >
        {left.map((t) => item(t.name, t.icon, t.iconOn))}
        <View style={{ width: 76, alignItems: "center", marginTop: -23 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log today"
            onPress={() => router.push("/check-in")}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: c.accent,
              borderWidth: 5,
              borderColor: c.surface,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ scale: pressed ? 0.95 : 1 }],
              ...shadows.float,
            })}
          >
            <Ionicons name="add" size={30} color="white" />
          </Pressable>
        </View>
        {right.map((t) => item(t.name, t.icon, t.iconOn))}
      </View>
    </View>
  );
}

export function IconBubble({
  name,
  tint,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  tint: string;
  color?: string;
}) {
  return (
    <View
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: tint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={name} size={20} color={color ?? c.plum} />
    </View>
  );
}

export function SectionHeading({
  icon,
  tint,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <IconBubble name={icon} tint={tint} />
      <View style={{ flex: 1, gap: 2 }}>
        <Copy kind="heading">{title}</Copy>
        {!!body && (
          <Copy kind="small" style={{ color: c.muted }}>
            {body}
          </Copy>
        )}
      </View>
    </View>
  );
}

export function SoftCard({
  children,
  tint = c.surface,
  onPress,
  style,
}: {
  children: React.ReactNode;
  tint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const body = (
    <View
      style={[
        {
          backgroundColor: tint,
          borderRadius: radius.md,
          borderCurve: "continuous",
          padding: 18,
          gap: 8,
          borderWidth: 1,
          borderColor: c.line,
          ...shadows.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      {body}
    </Pressable>
  );
}
