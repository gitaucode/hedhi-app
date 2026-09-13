import { Platform, ViewStyle } from "react-native";

export const colors = {
  background: "#FFF4F6",
  surface: "#FFFFFF",
  ink: "#4F2440",
  muted: "#A07B8C",
  plum: "#5B2A4A",
  rose: "#F08AA8",
  blush: "#FDE4EB",
  line: "#F3D5DE",
  sage: "#E4F3EA",
  green: "#3D7A64",
  lavender: "#EDE6F8",
  peach: "#FAD9CC",
  gold: "#FFE28A",
  danger: "#A52D4E",
  accent: "#E24B7A",
  title: "#C44B7A",
  mist: "#FFF9FA",
  shell: "#F4B7C6",
  petal: "#F7C5D4",
  peachSoft: "#F8D5C8",
  lavenderSoft: "#E9D7F6",
  banner: "#F8C9D6",
  coral: "#F6B79A",
  periwinkle: "#D7C6F6",
  warmRose: "#F4A3B7",
  powderBlue: "#C9D7F2",
  sand: "#F3D3A6",
};

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 12, md: 18, lg: 24, pill: 999 };

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#5A2440",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 1 },
    default: { boxShadow: "0 3px 12px rgba(90,36,64,0.06)" },
  })!,
  float: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#5A2440",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
    },
    android: { elevation: 5 },
    default: { boxShadow: "0 6px 18px rgba(90,36,64,0.13)" },
  })!,
};
