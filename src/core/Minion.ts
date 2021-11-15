import MinionCard from '@core/cards/MinionCard';
import Card from '@core/cards/Card';
import Target from '@core/Target';
import Game from '@core/Game';

type Modifier = {attack: number; health: number};
type ModifierFunction = (modifier: Modifier) => Partial<Modifier>;

/**
 * Class Minion represent a Minion in the board
 */
export default class Minion extends Target {
  readonly #card: MinionCard;
  public health: number;
  public attack: number;
  #modifiers: ModifierFunction[] = [];

  constructor(card: MinionCard, game?: Game) {
    super(game);
    this.#card = card;
    this.health = card.health;
    this.attack = card.attack;
  }

  public static fromCard(card: Card, game?: Game): Minion {
    if (card instanceof MinionCard) return new Minion(card, game);
    throw new SyntaxError(`Cannot create a minion with this card ${card.toString()}`);
  }

  public getCard(): MinionCard {
    return this.#card;
  }

  public addModifier(modifier: ModifierFunction): ModifierFunction {
    this.#modifiers.push(modifier);
    return modifier;
  }

  public removeModifier(modifier: ModifierFunction): ModifierFunction {
    const index = this.#modifiers.indexOf(modifier);
    if (index !== -1) this.#modifiers.splice(index, 1);
    return modifier;
  }

  public applyModifier(): Modifier {
    return this.#modifiers.reduce((p: Modifier, c) => ({...p, ...c(p)}), {
      attack: this.attack,
      health: this.health,
    });
  }

  override attackTarget(target: Target) {
    super.attackTarget(target);
    this.game?.emit('minionAttack', this, target);
  }

  override hurt(amount: number) {
    super.hurt(amount);
    this.game?.emit('minionHurt', this);
  }

  override die() {
    super.die();
    this.game?.emit('minionDied', this);
  }
}
