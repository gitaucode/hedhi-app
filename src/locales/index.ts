import en from "./en";
import sw from "./sw";
import { Language } from "../types";
export type TextKey = keyof typeof en;
export const translate = (
  language: Language,
  key: TextKey,
  values?: Record<string, string | number>,
) => {
  let text: string = { en, sw }[language][key];
  for (const [name, value] of Object.entries(values ?? {}))
    text = text.replaceAll(`{${name}}`, String(value));
  return text;
};
