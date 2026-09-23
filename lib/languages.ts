/**
 * Languages offered by the new-ebook form. The UI shows each language's own
 * (native) name, but the backend receives the English name: the `language`
 * field is written straight into the generation prompts ("Write in the book's
 * language: …"), so an English name is the least ambiguous value to send.
 * Any other value the user types is sent as-is.
 */
export type Language = { native: string; english: string };

/** Shown first, in this order. */
export const COMMON_LANGUAGES: Language[] = [
  { native: "English", english: "English" },
  { native: "Polski", english: "Polish" },
  { native: "Deutsch", english: "German" },
  { native: "Español", english: "Spanish" },
  { native: "Français", english: "French" },
  { native: "Português", english: "Portuguese" },
  { native: "Italiano", english: "Italian" },
];

export const OTHER_LANGUAGES: Language[] = [
  { native: "العربية", english: "Arabic" },
  { native: "Български", english: "Bulgarian" },
  { native: "Català", english: "Catalan" },
  { native: "Čeština", english: "Czech" },
  { native: "Dansk", english: "Danish" },
  { native: "Ελληνικά", english: "Greek" },
  { native: "Eesti", english: "Estonian" },
  { native: "فارسی", english: "Persian" },
  { native: "Suomi", english: "Finnish" },
  { native: "Filipino", english: "Filipino" },
  { native: "עברית", english: "Hebrew" },
  { native: "हिन्दी", english: "Hindi" },
  { native: "Hrvatski", english: "Croatian" },
  { native: "Magyar", english: "Hungarian" },
  { native: "Bahasa Indonesia", english: "Indonesian" },
  { native: "Íslenska", english: "Icelandic" },
  { native: "日本語", english: "Japanese" },
  { native: "한국어", english: "Korean" },
  { native: "Lietuvių", english: "Lithuanian" },
  { native: "Latviešu", english: "Latvian" },
  { native: "Bahasa Melayu", english: "Malay" },
  { native: "Nederlands", english: "Dutch" },
  { native: "Norsk", english: "Norwegian" },
  { native: "Português (Brasil)", english: "Brazilian Portuguese" },
  { native: "Română", english: "Romanian" },
  { native: "Русский", english: "Russian" },
  { native: "Slovenčina", english: "Slovak" },
  { native: "Slovenščina", english: "Slovenian" },
  { native: "Српски", english: "Serbian" },
  { native: "Svenska", english: "Swedish" },
  { native: "Kiswahili", english: "Swahili" },
  { native: "தமிழ்", english: "Tamil" },
  { native: "ไทย", english: "Thai" },
  { native: "Türkçe", english: "Turkish" },
  { native: "Українська", english: "Ukrainian" },
  { native: "اردو", english: "Urdu" },
  { native: "Tiếng Việt", english: "Vietnamese" },
  { native: "简体中文", english: "Chinese (Simplified)" },
  { native: "繁體中文", english: "Chinese (Traditional)" },
];

const ALL = [...COMMON_LANGUAGES, ...OTHER_LANGUAGES];

/** The label to show for a stored (English) value; custom values show as typed. */
export function languageLabel(value: string): string {
  const v = value.trim().toLowerCase();
  return ALL.find((l) => l.english.toLowerCase() === v)?.native ?? value;
}

export function matchesLanguage(l: Language, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || l.native.toLowerCase().includes(q) || l.english.toLowerCase().includes(q);
}
