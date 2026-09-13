import { Image } from "expo-image";
import { View } from "react-native";
import { colors as c } from "../theme";

type MoodFace = "happy" | "calm" | "tired" | "irritable" | "sad" | "anxious";

const moodIcons: Record<MoodFace, number> = {
  happy: require("../../assets/icons/moods/smiley-wink.svg"),
  calm: require("../../assets/icons/moods/smiley.svg"),
  tired: require("../../assets/icons/moods/smiley-x-eyes.svg"),
  irritable: require("../../assets/icons/moods/smiley-angry.svg"),
  sad: require("../../assets/icons/moods/smiley-sad.svg"),
  anxious: require("../../assets/icons/moods/smiley-nervous.svg"),
};

const moodTints: Record<MoodFace, string> = {
  happy: c.gold,
  calm: c.peach,
  tired: c.lavender,
  irritable: c.blush,
  sad: c.powderBlue,
  anxious: c.sand,
};

export function Face({
  mood,
  size = 56,
  color = c.plum,
}: {
  mood: MoodFace;
  size?: number;
  color?: string;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: moodTints[mood],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={moodIcons[mood]}
        contentFit="contain"
        tintColor={color}
        style={{ width: size * 0.72, height: size * 0.72 }}
      />
    </View>
  );
}
