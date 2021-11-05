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

class Locale<L extends string = string> {
  private locales = new Map<string, LocaleData>();
  constructor(public readonly language: L) {}

  static formatLocale<L extends string, C extends string>(locale: IsoLocale<L, C> | IsoLocale): FormatLocale<L, C> {
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
    this.locales.set(locale, merge(this.locales.get(locale) ?? {}, data));
    return true;
  }

  public getDefault(): LocaleData {
    return this.locales.get(this.language) ?? this.locales.values().next().value ?? {};
  }

  public getData<C extends string>(locale?: IsoLocale<L, C>): LocaleData {
    return !locale ? this.getDefault() : this.locales.get(Locale.formatLocale(locale).locale) ?? this.getDefault();
  }

  public getCatalog(): string[] {
    return [...this.locales.keys()];
  }

  public hasLocale<C extends string>(locale: IsoLocale<L, C>): boolean {
    return this.locales.has(Locale.formatLocale(locale).locale);
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

  public async load() {
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

  public setLocale<L extends string, C extends string>(locale: IsoLocale<L, C>): IsoLocale {
    if (this.hasLocale(locale)) this.#locale = Locale.formatLocale(locale);
    return this.#locale.locale;
  }

  public getLocale(): IsoLocale {
    return this.#locale.locale;
  }

  public hasKey(key: string, locale?: IsoLocale): boolean {
    const keys = key.split('.');
    let data = this.#currentLocale(locale) as Object;
    for (const k of keys) {
      if (!(k in data)) {
        return false;
      }
      data = data[k];
    }
    return true;
  }

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

  public getCatalog(): string[] {
    return [...this.#locales.values()].flatMap(locale => locale.getCatalog());
  }

  public hasLocale<L extends string, C extends string>(locale: IsoLocale<L, C>): boolean {
    const l = Locale.formatLocale(locale);
    return this.#locales.get(l.language)?.hasLocale(l.locale) ?? false;
  }
}
