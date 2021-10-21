import Card, {CardRarity} from './Card';

export default class Deck {
  static #MAX_CARDS = 30;
  #cards: Card[] = [];

  public addCard(card: Card): void {
    if (this.#cards.length >= Deck.#MAX_CARDS) {
      throw new Error(`Deck must have ${Deck.#MAX_CARDS} cards`);
    }
    if (this.#cards.filter(c => c.equals(card)).length >= 2) {
      throw new Error('Deck can only include 2 of each card');
    }
    if (
      card.rarity === CardRarity.LEGENDARY &&
      this.#cards.filter(c => c.equals(card)).length >= 1
    ) {
      throw new Error('Deck can only include 1 of each card of type Legendary');
    }

    this.#cards.push(card);
  }

  public getTopCard(): Card {
    return <Card>this.#cards.pop();
  }

  public removeAllCards(): void {
    this.#cards = [];
  }

  public shuffle(): void {
    for (let i = this.#cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = this.#cards[i];
      this.#cards[i] = this.#cards[j];
      this.#cards[j] = temp;
    }
  }

  public getCards(): Card[] {
    return [...this.#cards];
  }
}
