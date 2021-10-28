import * as fg from 'fast-glob';
import Card from '@core/cards/Card';
import {cardsDataFolder} from '@data/cards';
import {Log} from '@core/misc/Logger';

/**
 * Class CardManager is used to load and manage all the cards.
 * Cards are loaded from the cardsDataFolder. More than one card can be stored in the same file.
 */
export default class CardManager {
  private readonly cards = new Map<number, Readonly<Card>>();
  private loaded = false;

  async #loadFromFile(file: string) {
    const contents = await import(file);
    await Promise.allSettled(
      Object.entries<typeof Object>(contents).map(([key, CardClass]) =>
        (async () => {
          if (!(CardClass.prototype instanceof Card)) {
            throw new Error(`${key} is not a ${Card.name}`);
          }
          const card = Object.freeze(new CardClass() as Card);
          if (this.cards.has(card.id)) {
            throw new Error(`There are already a card with this id (${file}, ${key})`);
          }
          this.cards.set(card.id, card);
          return card;
        })()
          .then(c => {
            Log.info(`Card ${c.getIdStr()} loaded from ${file}`);
            return c;
          })
          .catch((e: Error) => {
            Log.error(`Error while loading card ${key} from ${file}`, e.toString());
            throw e;
          })
      )
    );
  }

  public async load() {
    const files = await fg('**/*.(ts|js)', {
      ignore: ['index.(ts|js)'],
      cwd: cardsDataFolder,
      absolute: true,
    });
    await Promise.allSettled(
      files.map(file =>
        this.#loadFromFile(file).catch((e: Error) => {
          Log.error(`Error while loading file ${file}`, e.toString());
          throw e;
        })
      )
    );
    this.loaded = true;
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public countCards(): number {
    return this.cards.size;
  }

  public getCards(): Readonly<Card>[] {
    return [...this.cards.values()].sort((a, b) => a.id - b.id);
  }

  public getCardById<T extends Card>(id: number): Readonly<T> | undefined {
    return this.cards.get(id) as T;
  }
}
