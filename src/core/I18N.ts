import * as fg from 'fast-glob';
import * as YAML from 'yaml';
import * as fs from 'fs';
import * as path from 'path';

export default class i18N {
  private locales = new Map<string, object>();
  private locale?: string;
  constructor(private localesPath: string) {}
  public async load() {
    const files = await fg('**/*.(yaml|yml)', {
      cwd: path.join(process.cwd(), this.localesPath),
      absolute: true,
    });
    await Promise.allSettled(
      files.map(async file => {
        const yamlFile = await fs.promises.readFile(file, 'utf8');
        const yaml = YAML.parse(yamlFile);
        const info = yaml.info;
        delete yaml.info;
        this.locales.set(info.locale, {
          ...(this.locales.get(info.locale) ?? {}),
          ...yaml,
        });
      })
    );
  }

  public setLocal(locale: string) {
    if (this.locales.has(locale)) this.locale = locale;
  }

  private currentLocale(): any {
    if (!this.locale || !this.locales.has(this.locale)) {
      return this.locales.values().next().value ?? {};
    }
    return this.locales.get(this.locale);
  }

  public t(key: string): string {
    const keys = key.split('.');
    let data = this.currentLocale();
    for (const k of keys) {
      if (!(k in data)) {
        console.warn(
          `Translation missing for "${key}" for locale "${this.locale}"`
        );
        return key;
      }
      data = data[k];
    }
    return data.toString();
  }
}
