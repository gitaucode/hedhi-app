import { Platform } from "react-native";
import { Snapshot } from "../types";
export async function exportData(data: Snapshot) {
  const contents = JSON.stringify(
    {
      format: "hedhi",
      version: 1,
      exportedAt: new Date().toISOString(),
      ...data,
    },
    null,
    2,
  );
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hedhi-export.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const { File, Paths } = await import("expo-file-system");
  const Sharing = await import("expo-sharing");
  const file = new File(Paths.cache, "hedhi-export.json");
  try {
    file.create({ overwrite: true });
    file.write(contents);
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      UTI: "public.json",
    });
  } finally {
    if (file.exists) file.delete();
  }
}
