import * as fg from 'fast-glob';
import * as path from 'path';
import Card from '@core/cards/Card';

export default class CardManager {
  private readonly cards = new Map<number, Readonly<Card>>();
  private loaded = false;

  public async load() {
    const files = await fg('**/*.(ts|js)', {
      cwd: path.join(process.cwd(), 'src/data/cards'),
      absolute: true,
    });
    const result = await Promise.allSettled(
      files.map(async file => {
        const exports = await import(file);
        for (const key in exports) {
          const CardClass = exports[key];
          if (CardClass.prototype instanceof Card) {
            const card = new CardClass() as Card;
            if (this.cards.has(card.id)) {
              throw new Error(
                `There are already a card with this id (${file}, ${key})`
              );
            }
            console.log(`${card.getIdStr()} loaded`);
            this.cards.set(card.id, Object.freeze(card));
          }
        }
      })
    );
    console.log(result);
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

  public getCardById(id: number): Readonly<Card> | undefined {
    return this.cards.get(id);
  }
}
