import MinionCard, {MinionGameContext} from '@core/cards/MinionCard';
import Card from '@core/cards/Card';
import Target from '@core/Target';
import Game, {GameContext} from '@core/Game';
import Hero from '@core/Hero';
import {MinionNotAttachedToGameError} from '@core/error/errors';

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
  readonly #hero?: Hero;

  constructor(card: MinionCard, hero?: Hero) {
    super(hero?.game);
    this.#card = card;
    this.#hero = hero;
    this.health = card.health;
    this.attack = card.attack;
  }

  //todo: possibly duplicate the context but it's possible that the hero changes
  get context(): MinionGameContext {
    if (!this.#hero || !this.game) throw new MinionNotAttachedToGameError();
    return GameContext.create(this.game, this.#hero, {minion: this});
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
