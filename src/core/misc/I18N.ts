import * as fg from 'fast-glob';
import * as YAML from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import * as merge from 'deepmerge';
import {Log} from '@core/misc/Logger';

type LocaleData = {
  [key: string]: LocaleData | string | number | boolean;
};
type IsoLocale<L extends string = string, C extends string = string> = `${L}-${C}` | `${L}`;
type YamlFile<L extends string = string, C extends string = string> = LocaleData & {
  info: {locale: IsoLocale<L, C>; version: string};
};
type FormatLocale<L extends string = string, C extends string = string> = {
  locale: Lowercase<IsoLocale<L, C>>;
  language: Lowercase<L>;
  country: Lowercase<C>;
};

/**
 * @internal
 * Locale regroups all the data for a specific language.
 */
class Locale<L extends string = string> {
  #locales = new Map<string, LocaleData>();
  constructor(public readonly language: L) {}
  public static formatLocale<L extends string, C extends string>(
    locale: IsoLocale<L, C> | IsoLocale
  ): FormatLocale<L, C> {
    const formatted = locale.toLowerCase().replace(/[^a-z]/g, '-');
    const [language, country] = formatted.split('-');
    return {
      locale: formatted as Lowercase<IsoLocale<L, C>>,
      language: language as Lowercase<L>,
      country: country as Lowercase<C>,
    };
  }

  public add({info, ...data}: YamlFile<L>): boolean {
    const {locale, language} = Locale.formatLocale(info.locale);
    if (language !== this.language) return false;
    this.#locales.set(locale, merge(this.#locales.get(locale) ?? {}, data));
    return true;
  }

  public getDefault(): LocaleData {
    return this.#locales.get(this.language) ?? this.#locales.values().next().value ?? {};
  }

  public getData<C extends string>(locale?: IsoLocale<L, C>): LocaleData {
    return !locale ? this.getDefault() : this.#locales.get(Locale.formatLocale(locale).locale) ?? this.getDefault();
  }

  public getLocales(): Map<string, LocaleData> {
    return this.#locales;
  }

  public getCatalog(): string[] {
    return [...this.#locales.keys()];
  }

  public hasLocale<C extends string>(locale: IsoLocale<L, C>): boolean {
    return this.#locales.has(Locale.formatLocale(locale).locale);
  }
}

/**
 * I18N is a class that provides localization support
 * @remarks it works with YAML files, it accepts multiple files and merge them to one dictionary
 */
export default class I18N {
  #locales = new Map<string, Locale>();
  #locale: FormatLocale;

  #currentLocale(locale?: IsoLocale | undefined): LocaleData {
    const l = locale ? Locale.formatLocale(locale) : this.#locale;
    return this.#locales.get(l.language)?.getData(l.locale) ?? {};
  }

  constructor(private localesPath: string, defaultLocale: IsoLocale) {
    this.#locale = Locale.formatLocale(defaultLocale);
  }

  /**
   * Loads all YAML files
   */
  public async load(): Promise<void> {
    const files = await fg('**/*.(yaml|yml)', {
      cwd: path.join(process.cwd(), this.localesPath),
      absolute: true,
    });
    await Promise.allSettled(
      files.map(async file => {
        const yamlFile = await fs.promises.readFile(file, 'utf8');
        const yaml = YAML.parse(yamlFile) as YamlFile;
        const {language} = Locale.formatLocale(yaml.info.locale);
        if (!this.#locales.has(language)) this.#locales.set(language, new Locale(language));
        const locale = this.#locales.get(language) as Locale;
        locale.add(yaml);
      })
    );
  }

  /**
   * Set the current locale
   * @param locale the locale to set
   * @remarks if the locale is not found, it will fallback to the previous locale
   */
  public setLocale<L extends string, C extends string>(locale: IsoLocale<L, C>): IsoLocale {
    if (this.hasLocale(locale)) this.#locale = Locale.formatLocale(locale);
    return this.#locale.locale;
  }

  /**
   * Returns the current locale
   * @returns the current locale
   */
  public getLocale(): IsoLocale {
    return this.#locale.locale;
  }

  /**
   * Returns all available locales
   * @returns all available locales
   */
  public getCatalog(): string[] {
    return [...this.#locales.values()].flatMap(locale => locale.getCatalog());
  }

  /**
   * Check if a key exists in the current or chosen locale
   * @param key the key to check
   * @param locale
   */
  public hasKey(key: string, locale?: IsoLocale): boolean {
    let data = this.#currentLocale(locale) as Object;
    for (const k of key.split('.')) {
      if (!(k in data)) {
        return false;
      }
      data = data[k];
    }
    return true;
  }

  /**
   * Check if a locale is available
   * @param locale locale to check availability
   */
  public hasLocale<L extends string, C extends string>(locale: IsoLocale<L, C>): boolean {
    const l = Locale.formatLocale(locale);
    return this.#locales.get(l.language)?.hasLocale(l.locale) ?? false;
  }

  /**
   * Translate a key with current locale
   * @param key key to translate
   * @param placeholder If not translated, return the key with placeholder
   * @remarks if no translation available and no placeholder is provided, the key will be returned
   */
  public t(key: string, placeholder?: string): string {
    let data = this.#currentLocale() as Object;
    for (const k of key.split('.')) {
      if (!(k in data)) {
        Log.warn(`Translation missing for "${key}" for locale "${this.#locale.locale}"`, {placeholder});
        return placeholder ?? key;
      }
      data = data[k];
    }
    return data.toString();
  }

  /**
   * Verify in all locales if a key missing
   */
  public verifyMissingKey(): void {
    const allLocales = [...this.#locales.values()].flatMap(locale => [...locale.getLocales()]);
    const merged = allLocales.reduce((previousValue, currentValue) => {
      return merge(previousValue, currentValue[1]);
    }, {});
    const getMissingKeys = (locale: Object): string[] => {
      const missingKeys: string[] = [];
      const iterate = (a: Object, b?: Object, prefix = '') => {
        for (const key in a) {
          const currentKey = prefix + key;
          if (typeof a[key] === 'object') iterate(a[key], (b ?? {})[key], currentKey + '.');
          else {
            if (!b || !(key in b)) missingKeys.push(currentKey);
          }
        }
      };
      iterate(merged, locale);
      return missingKeys;
    };
    allLocales.forEach(locale => {
      const missingKeys = getMissingKeys(locale[1]);
      if (missingKeys.length > 0) {
        Log.warn(`Missing keys for locale "${locale[0]}"`, missingKeys);
      } else {
        Log.info(`No missing keys for locale "${locale[0]}"`);
      }
    });
  }
}
