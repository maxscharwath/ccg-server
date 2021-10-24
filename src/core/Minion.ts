import MinionCard from '@core/cards/MinionCard';

/**
 * Class Minion represent a Minion in the board
 */
export default class Minion {
  readonly #card: MinionCard;

  constructor(card: MinionCard) {
    this.#card = card;
  }

  public getCard(): MinionCard {
    return this.#card;
  }

  public get attack(): number {
    return this.#card.attack;
  }
  public get health(): number {
    return this.#card.health;
  }
}
