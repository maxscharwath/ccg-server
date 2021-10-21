export enum CardRarity {
  COMMON,
  RARE,
  EPIC,
  LEGENDARY,
}
export default abstract class Card {
  public readonly type: string = 'card';
  abstract id: number;
  abstract name: string;
  abstract text: string;

  abstract rarity: CardRarity;
  abstract cost: number;

  public equals(card: Card): boolean {
    return card.id === this.id;
  }
  public getClass(): typeof Card {
    return this.constructor as typeof Card;
  }

  public getIdStr(): string {
    return `${this.type}#${this.id.toString(16).padStart(4, '0')}`;
  }
}
