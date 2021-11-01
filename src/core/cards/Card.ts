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
  public static readonly RARITY: typeof CardRarity = CardRarity;
  public readonly type: string = 'card';
  public abstract readonly id: CardId;
  public abstract readonly tag: string;
  public abstract readonly rarity: CardRarity;
  public abstract cost: number;

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
    return Object.assign(new (this.getClass())() as T, this);
  }

  public isReadonly(): boolean {
    return Object.isFrozen(this);
  }

  public toJSON(): object {
    return {
      ...this,
    };
  }
}
