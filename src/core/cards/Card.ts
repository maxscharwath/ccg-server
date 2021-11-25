import * as crypto from 'crypto';
import {CardRarity} from '@core/cards/CardRarity';

export type CardId = number;

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
  readonly #uuid = crypto.randomUUID();
  #origin?: Card;

  public get uuid() {
    return this.#uuid;
  }

  public equals(card: Card): boolean {
    return !card ? false : card.id === this.id;
  }

  public getClass<T extends Card>(this: T): new (...args: any[]) => T {
    return this.constructor as new (...args: any[]) => T;
  }

  public getIdStr(): string {
    return `${this.type}#${this.id.toString(16).padStart(4, '0')}`;
  }

  public clone<T extends Card>(this: T, keepOrigin = true): T {
    const c = Object.assign(new (this.getClass())() as T, this);
    if (keepOrigin) c.#origin = this as Card;
    return c;
  }

  public isReadonly(): boolean {
    return Object.isFrozen(this);
  }

  public getOriginal<T extends Card>(this: T): T {
    let card = this as T;
    while (card.#origin) card = card.#origin as T;
    return card;
  }

  public isOriginal(): boolean {
    return !this.#origin;
  }

  public getOrigin<T extends Card>(this: T): T | undefined {
    return (this as T).#origin as T | undefined;
  }

  public toJSON(): object {
    return {
      ...this,
      uuid: this.uuid,
      original: this.getOriginal().uuid,
      class: this.getClass().name,
    };
  }
}
