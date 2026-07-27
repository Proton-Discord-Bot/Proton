import en from './en.json';
import de from './de.json';

const catalogs = { en, de } as const;
export type Locale = keyof typeof catalogs;

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
export type I18nKey = Leaves<typeof en>;
export type Translator = (key: I18nKey, vars?: Record<string, string | number>) => string;

/** Every locale we ship copy for besides the `en` default used as the builder's base text. */
const NON_DEFAULT_LOCALES = ['de'] as const satisfies readonly Exclude<Locale, 'en'>[];

/**
 * Localization map for discord.js `setDescriptionLocalizations` / `setNameLocalizations`.
 * Command metadata is registered once at deploy time, so it cannot go through a
 * per-interaction translator the way reply copy does.
 */
export function localizations(key: I18nKey): Record<string, string> {
  return Object.fromEntries(NON_DEFAULT_LOCALES.map((l) => [l, makeTranslator(l)(key)]));
}

export function resolveLocale(raw: string): Locale {
  const short = raw.slice(0, 2);
  return short === 'de' ? 'de' : 'en';
}

function lookup(cat: unknown, key: string): string {
  const val = key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], cat);
  return typeof val === 'string' ? val : key;
}

export function makeTranslator(locale: Locale): Translator {
  const cat = catalogs[locale];
  return (key, vars) => {
    let s = lookup(cat, key);
    if (s === key) s = lookup(catalogs.en, key); // fallback to en
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };
}

/** English catalog, for the base text of command metadata built at module load. */
export const tEn = makeTranslator('en');
