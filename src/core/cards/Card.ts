export type CardId = number;

export enum CardRarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
}

/**
 * Class Card represent the base of all cards
 */
export default abstract class Card {
  public readonly type: string = 'card';
  abstract readonly id: CardId;
  abstract readonly name: string;
  abstract readonly text: string;
  abstract readonly rarity: CardRarity;

  abstract cost: number;

  public equals(card: Card): boolean {
    return card.id === this.id;
  }

  public getClass<T extends Card>(this: Readonly<T> | T): new (...args: any[]) => T {
    return this.constructor as new (...args: any[]) => T;
  }

  public getIdStr(): string {
    return `${this.type}#${this.id.toString(16).padStart(4, '0')}`;
  }

  public clone<T extends Card>(this: Readonly<T> | T): T {
    return new (this.getClass())() as T;
  }
}
