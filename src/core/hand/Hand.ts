import Card from '@core/cards/Card';
import ArrayCapacity from '@studimax/array-capacity';

export default class Hand extends ArrayCapacity<Card> {
  static #MAX_CARDS = 10;

  constructor() {
    super({
      capacity: Hand.#MAX_CARDS,
    });
  }

  /**
   * @throws RangeError
   * @param card
   */
  public addCard(card: Card): void {
    if (this.length >= Hand.#MAX_CARDS) {
      throw new RangeError(`Hand must have ${Hand.#MAX_CARDS} cards`);
    }
    this.push(card);
  }

  public hasCard(card: Card): boolean {
    return this.some(c => card.equals(c));
  }

  public getCards(): Card[] {
    return [...this];
  }

  public override at<T extends Card = Card>(index: number): T {
    return super.at(index) as T;
  }
}
