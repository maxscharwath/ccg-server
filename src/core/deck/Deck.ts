import Card, {CardRarity} from '@core/cards/Card';
import ArrayCapacity from '@core/misc/ArrayCapacity';

/**
 * Class Deck represent a Stack of Cards
 * @see Card
 */
export default class Deck extends ArrayCapacity<Card> {
  static #MAX_CARDS = 30;

  constructor() {
    super(Deck.#MAX_CARDS);
  }

  public addCard(card: Card): void {
    if (this.length >= Deck.#MAX_CARDS) {
      throw new RangeError(`Deck must have ${Deck.#MAX_CARDS} cards`);
    }
    if (this.filter(c => c.equals(card)).length >= 2) {
      throw new Error('Deck can only include 2 of each card');
    }
    if (
      card.rarity === CardRarity.LEGENDARY &&
      this.filter(c => c.equals(card)).length >= 1
    ) {
      throw new Error('Deck can only include 1 of each card of type Legendary');
    }

    this.push(card);
  }

  public getTopCard(): Card {
    return <Card>this.pop();
  }

  public removeAllCards(): void {
    this.splice(0, this.length);
  }

  public shuffle(): void {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = this[i];
      this[i] = this[j];
      this[j] = temp;
    }
  }

  public getCards(): Card[] {
    return [...this];
  }
}
