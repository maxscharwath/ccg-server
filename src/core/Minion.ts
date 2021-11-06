import MinionCard from '@core/cards/MinionCard';
import Card from '@core/cards/Card';

type Modifier = {attack: number; health: number};
type ModifierFunction = (modifier: Modifier) => Partial<Modifier>;

/**
 * Class Minion represent a Minion in the board
 */
export default class Minion {
  readonly #card: MinionCard | Readonly<MinionCard>;
  private modifiers: ModifierFunction[] = [];

  constructor(card: MinionCard | Readonly<MinionCard>) {
    this.#card = card;
  }

  public get attack(): number {
    return this.#card.attack;
  }

  public get health(): number {
    return this.#card.health;
  }

  static fromCard(card: Card | Readonly<Card>): Minion {
    if (card instanceof MinionCard) return new Minion(card);
    throw new SyntaxError(`Cannot create a minion with this card ${card.toString()}`);
  }

  public getCard(): MinionCard | Readonly<MinionCard> {
    return this.#card;
  }

  public addModifier(...modifiers: ModifierFunction[]) {
    this.modifiers.push(...modifiers);
    return this;
  }

  public applyModifier(): Modifier {
    return this.modifiers.reduce((p: Modifier, c) => ({...p, ...c(p)}), {
      attack: this.attack,
      health: this.health,
    });
  }
}
