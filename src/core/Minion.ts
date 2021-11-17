import MinionCard, {MinionGameContext} from '@core/cards/MinionCard';
import Card from '@core/cards/Card';
import Target from '@core/Target';
import {GameContext} from '@core/Game';
import Hero from '@core/Hero';
import {MinionNotAttachedToGameError} from '@core/error/errors';

type Modifier = {attack: number; health: number};
type ModifierFunction = (modifier: Modifier) => Partial<Modifier>;

/**
 * Class Minion represent a Minion in the board
 */
export default class Minion extends Target {
  public health: number;
  public attack: number;
  readonly #card: MinionCard;
  #modifiers: ModifierFunction[] = [];
  readonly #hero?: Hero;
  #context?: MinionGameContext;

  constructor(card: MinionCard, hero?: Hero) {
    super(hero?.game);
    this.#card = card;
    this.#hero = hero;
    this.health = card.health;
    this.attack = card.attack;
  }

  get context(): MinionGameContext {
    if (!this.#hero || !this.game) throw new MinionNotAttachedToGameError();
    if (!this.#context || (this.#context && this.#context.hero !== this.#hero && !this.context.isGame(this.game))) {
      this.#context = GameContext.create(this.game, this.#hero, {minion: this});
    }
    return this.#context as MinionGameContext;
  }

  public static fromCard(card: Card, hero?: Hero): Minion {
    if (card instanceof MinionCard) return new Minion(card, hero);
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
