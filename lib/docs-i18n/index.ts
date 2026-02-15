/**
 * Documentation Content Internationalization System
 *
 * Each doc page has a content file (e.g., getting-started.ts) that maps
 * translation keys → localized strings for all supported languages.
 *
 * Content keys follow the pattern: section.subsection.element
 * Code blocks are NOT translated — only prose, headings, descriptions.
 */

import type { Locale } from "@/helix-wiki/lib/i18n";

export type DocTranslations = Record<string, string>;
export type DocContent = Partial<Record<Locale, DocTranslations>>;

/**
 * Get a translated string for a doc page.
 * Falls back to English if the key is missing in the current locale.
 */
export function getDocString(
  content: DocContent,
  locale: Locale,
  key: string,
): string {
  return content[locale]?.[key] ?? content.en?.[key] ?? key;
}
