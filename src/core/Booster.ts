import ArrayCapacity from '@studimax/array-capacity';
import Card from '@core/cards/Card';
import CardManager from '@core/cards/CardManager';
import RNG, {Seed} from '@core/RNG';
import {createHash} from 'crypto';
export default class Booster {
  public hash!: string;
  public seed!: string;
  readonly #seed: number | string;
  public readonly cards: Readonly<ArrayCapacity<Card>>;
  constructor(seed: number | string, cardManager: CardManager) {
    this.#seed = Seed.from(seed);
    this.cards = this.#generate(cardManager);
    Object.defineProperty(this, 'hash', {
      get: () => {
        return createHash('sha256')
          .update(this.cards.map(card => card.id).join('-'))
          .digest('hex');
      },
      enumerable: true,
    });
    Object.defineProperty(this, 'seed', {
      get: () => this.#seed,
      enumerable: true,
    });
  }

  #generate(cardManager: CardManager): Readonly<ArrayCapacity<Card>> {
    const array = new ArrayCapacity<Card>({capacity: 6});
    const rng = new RNG(this.#seed);
    const cards = cardManager.getCards();
    const totalWeight = cards.reduce((total, card) => total + card.rarity.valueOf(), 0);
    const pick = () => {
      const random = rng.random(totalWeight);
      let currentWeight = 0;
      for (const card of cards) {
        currentWeight += card.rarity.valueOf();
        if (currentWeight > random) {
          return card;
        }
      }
      return cards[cards.length - 1];
    };
    for (let i = 0; i < array.capacity; i++) {
      array.push(pick());
    }
    return Object.freeze(array) as Readonly<ArrayCapacity<Card>>;
  }
}
