import * as fg from 'fast-glob';
import Card from '@core/cards/Card';
import {cardsDataFolder} from '@data/cards';
import {Log} from '@core/misc/Logger';

export default class CardManager {
  private readonly cards = new Map<number, Readonly<Card>>();
  private loaded = false;

  public async load() {
    const files = await fg('**/*.(ts|js)', {
      ignore: ['index.(ts|js)'],
      cwd: cardsDataFolder,
      absolute: true,
    });
    await Promise.all(
      files
        .map(async file =>
          Object.entries<typeof Object>(await import(file))
            .map(async ([key, CardClass]) => {
              if (!(CardClass.prototype instanceof Card)) {
                throw new Error(`${key} is not a ${Card.name}`);
              }
              const card = Object.freeze(new CardClass() as Card);
              if (this.cards.has(card.id)) {
                throw new Error(`There are already a card with this id (${file}, ${key})`);
              }
              this.cards.set(card.id, card);
              return card;
            })
            .map(p => p.then(card => Log.info(`${card.getIdStr()} loaded`)).catch(e => Log.error(e)))
        )
        .map(p => p.catch(e => Log.error(e)))
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
