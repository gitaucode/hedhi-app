import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors as c, radius, shadows } from "../theme";
import { art } from "../constants/art";
import { Face } from "./faces";

export function Copy({
  children,
  kind = "body",
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  kind?: "body" | "title" | "heading" | "small" | "eyebrow";
  style?: any;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      maxFontSizeMultiplier={1.4}
      style={[
        {
          color: kind === "title" ? c.title : c.ink,
          fontSize:
            kind === "title"
              ? 34
              : kind === "heading"
                ? 20
                : kind === "small"
                  ? 12
                  : kind === "eyebrow"
                    ? 12
                    : 15,
          lineHeight:
            kind === "title" ? 40 : kind === "heading" ? 26 : kind === "small" ? 17 : 22,
          fontWeight:
            kind === "title"
              ? "700"
              : kind === "heading"
                ? "700"
                : kind === "eyebrow"
                  ? "600"
                  : "400",
          letterSpacing: kind === "eyebrow" ? 0.4 : kind === "title" ? -0.6 : 0,
          fontFamily: undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Page({
  children,
  padded = true,
  backgroundColor = c.background,
}: {
  children: React.ReactNode;
  padded?: boolean;
  backgroundColor?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor }}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: padded ? 22 : 0,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 20) + 28,
          gap: 18,
          width: "100%",
          backgroundColor,
        }}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function Card({
  children,
  tint = c.surface,
  style,
}: {
  children: React.ReactNode;
  tint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: tint,
          borderRadius: radius.md,
          borderCurve: "continuous",
          padding: 18,
          gap: 10,
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
}

export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  chevron = false,
  style,
}: {
  title: string;
  onPress: () => void | Promise<void>;
  secondary?: boolean;
  disabled?: boolean;
  chevron?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 54,
          paddingHorizontal: 22,
          paddingVertical: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          borderRadius: radius.pill,
          backgroundColor: secondary ? c.blush : c.plum,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <Copy
        style={{
          color: secondary ? c.plum : "white",
          fontWeight: "700",
          textAlign: "center",
          fontSize: 16,
        }}
      >
        {title}
      </Copy>
      {chevron && (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={secondary ? c.plum : "white"}
        />
      )}
    </Pressable>
  );
}

export function Action({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => Promise<void>;
  secondary?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      title={busy ? "…" : title}
      secondary={secondary}
      disabled={busy}
      onPress={async () => {
        setBusy(true);
        try {
          await onPress();
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  number = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  number?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Copy style={{ fontWeight: "600", fontSize: 14 }}>{label}</Copy>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        keyboardType={number ? "decimal-pad" : "default"}
        multiline={multiline}
        maxLength={multiline ? 2000 : 120}
        autoCapitalize={number ? "none" : multiline ? "sentences" : "words"}
        autoCorrect={!number}
        maxFontSizeMultiplier={1.4}
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.sm,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: c.line,
          padding: 16,
          minHeight: 52,
          fontSize: 16,
          color: c.ink,
          ...shadows.card,
          ...(multiline ? { minHeight: 110, textAlignVertical: "top" } : {}),
        }}
      />
    </View>
  );
}

function dateValue(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function localDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function DateField({
  label,
  value,
  onChangeText,
  placeholder,
  language = "en",
  minimumDate,
  maximumDate,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  language?: "en" | "sw";
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const [show, setShow] = useState(false);
  if (process.env.EXPO_OS === "web") {
    return (
      <Field
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    );
  }
  const picker = (
    <DateTimePicker
      value={dateValue(value)}
      mode="date"
      display={process.env.EXPO_OS === "ios" ? "compact" : "default"}
      maximumDate={maximumDate}
      minimumDate={minimumDate}
      locale={language === "sw" ? "sw_KE" : "en_KE"}
      accentColor={c.accent}
      onDismiss={() => setShow(false)}
      onValueChange={(_, date) => {
        onChangeText(localDate(date));
        if (process.env.EXPO_OS === "android") setShow(false);
      }}
    />
  );
  return (
    <View style={{ gap: 8 }}>
      <Copy style={{ fontWeight: "600", fontSize: 14 }}>{label}</Copy>
      {process.env.EXPO_OS === "ios" ? (
        <View
          style={{
            minHeight: 52,
            borderRadius: radius.sm,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.surface,
            paddingHorizontal: 12,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {picker}
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => setShow(true)}
            style={({ pressed }) => ({
              minHeight: 52,
              borderRadius: radius.sm,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: c.line,
              backgroundColor: c.surface,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="calendar-outline" size={19} color={c.plum} />
            <Copy style={{ flex: 1 }}>{value || placeholder}</Copy>
          </Pressable>
          {show && picker}
        </>
      )}
    </View>
  );
}

export function TimeField({
  label,
  hour,
  onChangeHour,
  language = "en",
}: {
  label: string;
  hour: number;
  onChangeHour: (hour: number) => void;
  language?: "en" | "sw";
}) {
  const [show, setShow] = useState(false);
  const value = new Date();
  value.setHours(hour, 0, 0, 0);
  if (process.env.EXPO_OS === "web") {
    return (
      <Field
        label={label}
        value={String(hour)}
        onChangeText={(next) => onChangeHour(Number(next))}
        number
      />
    );
  }
  const picker = (
    <DateTimePicker
      value={value}
      mode="time"
      display={process.env.EXPO_OS === "ios" ? "compact" : "default"}
      locale={language === "sw" ? "sw_KE" : "en_KE"}
      accentColor={c.accent}
      onDismiss={() => setShow(false)}
      onValueChange={(_, date) => {
        onChangeHour(date.getHours());
        if (process.env.EXPO_OS === "android") setShow(false);
      }}
    />
  );
  return (
    <View style={{ gap: 8 }}>
      <Copy style={{ fontWeight: "600", fontSize: 14 }}>{label}</Copy>
      {process.env.EXPO_OS === "ios" ? (
        <View
          style={{
            minHeight: 52,
            borderRadius: radius.sm,
            borderCurve: "continuous",
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.surface,
            paddingHorizontal: 12,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {picker}
        </View>
      ) : (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => setShow(true)}
            style={({ pressed }) => ({
              minHeight: 52,
              borderRadius: radius.sm,
              borderCurve: "continuous",
              borderWidth: 1,
              borderColor: c.line,
              backgroundColor: c.surface,
              paddingHorizontal: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Ionicons name="time-outline" size={19} color={c.plum} />
            <Copy style={{ flex: 1, fontVariant: ["tabular-nums"] }}>
              {value.toLocaleTimeString(language === "sw" ? "sw-KE" : "en-KE", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </Copy>
          </Pressable>
          {show && picker}
        </>
      )}
    </View>
  );
}

export function Art({
  name,
  source,
  size = 64,
}: {
  name?: keyof typeof art;
  source?: any;
  size?: number;
}) {
  const src = source ?? (name ? art[name] : undefined);
  if (!src) return null;
  return (
    <Image
      source={src}
      contentFit="contain"
      style={{ width: size, height: size, alignSelf: "center" }}
      accessibilityIgnoresInvertColors
    />
  );
}

const moodKeys = [
  "happy",
  "calm",
  "tired",
  "irritable",
  "sad",
  "anxious",
] as const;

export function Chips<T extends string>({
  options,
  selected,
  onSelect,
  label,
  icons,
  columns,
}: {
  options: readonly T[];
  selected: readonly T[];
  onSelect: (value: T) => void;
  label: (value: T) => string;
  icons?: Partial<Record<T, keyof typeof art | any>>;
  columns?: number;
}) {
  const renderChip = (value: T, grid = false) => {
    const on = selected.includes(value);
    const mood = moodKeys.includes(value as (typeof moodKeys)[number]);
    return (
      <Pressable
        key={value}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        onPress={() => onSelect(value)}
        style={({ pressed }) => ({
          ...(grid
            ? {
                flex: 1,
                minWidth: 0,
                minHeight: mood ? 92 : icons?.[value] ? 98 : 54,
                paddingVertical: 12,
                paddingHorizontal: 4,
                justifyContent: "center" as const,
              }
            : {
                minWidth: 46,
                minHeight: 46,
                justifyContent: "center" as const,
                paddingVertical: 10,
                paddingHorizontal: mood ? 12 : 14,
              }),
          borderRadius: radius.sm,
          borderCurve: "continuous",
          backgroundColor: on ? c.blush : c.surface,
          borderWidth: 1,
          borderColor: on ? c.accent : c.line,
          opacity: pressed ? 0.65 : 1,
          alignItems: "center",
          gap: mood || icons?.[value] ? 7 : 0,
          ...(grid ? {} : shadows.card),
        })}
      >
        {mood && <Face mood={value as (typeof moodKeys)[number]} size={44} />}
        {icons?.[value] && !mood &&
          (typeof icons[value] === "string" ? (
            <Art name={icons[value] as keyof typeof art} size={34} />
          ) : (
            <Image
              source={icons[value] as any}
              contentFit="contain"
              style={{ width: 40, height: 40, alignSelf: "center" }}
              accessibilityIgnoresInvertColors
            />
          ))}
        <Copy
          numberOfLines={1}
          style={{
            fontSize: 13,
            lineHeight: 18,
            fontWeight: on ? "700" : "600",
            color: on ? c.plum : c.muted,
            textAlign: "center",
          }}
        >
          {label(value)}
        </Copy>
      </Pressable>
    );
  };

  if (columns && columns > 0) {
    const rows: T[][] = [];
    for (let index = 0; index < options.length; index += columns) {
      rows.push(options.slice(index, index + columns) as T[]);
    }
    return (
      <View style={{ gap: 10 }}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: "row", gap: 10 }}>
            {row.map((value) => renderChip(value, true))}
            {Array.from({ length: columns - row.length }, (_, index) => (
              <View key={`spacer-${index}`} style={{ flex: 1 }} />
            ))}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {options.map((value) => renderChip(value))}
    </View>
  );
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
      {children}
    </View>
  );
}

export function Message({
  text,
  tone = "error",
}: {
  text: string;
  tone?: "success" | "warning" | "error" | "info";
}) {
  if (!text) return null;
  const presentation = {
    success: { tint: c.sage, color: c.green, icon: "checkmark-circle" },
    warning: { tint: c.peach, color: c.plum, icon: "alert-circle" },
    error: { tint: c.blush, color: c.danger, icon: "close-circle" },
    info: { tint: c.lavender, color: c.plum, icon: "information-circle" },
  }[tone] as {
    tint: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
  };
  return (
    <View
      accessibilityRole="alert"
      style={{
        minHeight: 52,
        borderRadius: radius.sm,
        borderCurve: "continuous",
        backgroundColor: presentation.tint,
        borderWidth: 1,
        borderColor: c.line,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Ionicons name={presentation.icon} size={20} color={presentation.color} />
      <Copy style={{ flex: 1, color: presentation.color, fontWeight: "600" }}>
        {text}
      </Copy>
    </View>
  );
}

export function Loading() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.background,
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color={c.plum} />
    </View>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const web = Platform.OS === "web";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: web ? c.shell : c.background,
        alignItems: web ? "center" : undefined,
        justifyContent: web ? "center" : undefined,
      }}
    >
      <View
        style={
          web
            ? {
                width: "100%",
                maxWidth: 402,
                height: "100%",
                maxHeight: 874,
                borderRadius: 36,
                overflow: "hidden",
                backgroundColor: c.background,
                ...shadows.float,
              }
            : { flex: 1, backgroundColor: c.background }
        }
      >
        {children}
      </View>
    </View>
  );
}
