import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
export async function lockEnabled() {
  return (
    Platform.OS !== "web" &&
    (await SecureStore.getItemAsync("hedhi.lock")) === "true"
  );
}
export async function authenticate(prompt: string) {
  if (Platform.OS === "web") return false;
  return (
    await LocalAuthentication.authenticateAsync({ promptMessage: prompt })
  ).success;
}
export async function setLock(enabled: boolean, prompt: string) {
  if (Platform.OS === "web") return false;
  if (!(await LocalAuthentication.isEnrolledAsync())) return false;
  if (!(await authenticate(prompt))) return false;
  await SecureStore.setItemAsync("hedhi.lock", String(enabled));
  return true;
}
export async function clearLock() {
  if (Platform.OS !== "web") await SecureStore.deleteItemAsync("hedhi.lock");
}
