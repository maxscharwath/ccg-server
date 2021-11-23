import Deck from '@core/deck/Deck';
import Hand from '@core/hand/Hand';
import Target from '@core/Target';
import Game from '@core/Game';
import Card from '@core/cards/Card';
import {EmptyDeckError, HandFullError, MinionNotAttachedToGameError, UnknownCardError} from '@core/error/errors';
import MinionCard from '@core/cards/MinionCard';
import SpellCard from '@core/cards/SpellCard';
import Board from '@core/Board';
import Minion from '@core/Minion';

export default class Hero extends Target {
  public readonly deck: Deck;
  public readonly hand: Hand = new Hand();
  public health = 30;
  public attack = 0;
  #maxMana = 10;
  #mana = 0;
  #availableMana = 0;

  public get mana(): number {
    return this.#mana;
  }

  public set mana(value: number) {
    this.#mana = Math.min(Math.max(value, 0), this.#availableMana);
  }

  public get maxMana(): number {
    return this.#maxMana;
  }

  public get availableMana(): number {
    return this.#availableMana;
  }

  public set availableMana(value: number) {
    this.#availableMana = Math.min(Math.max(value, 0), this.#maxMana);
  }

  constructor(game?: Game) {
    super(game);
    this.deck = new Deck();
  }

  get board(): Board | undefined {
    return this.game?.boards.get(this);
  }

  /**
   * Draws a card from the deck and put in hand.
   * @throws {EmptyDeckError} If the deck is empty.
   * @throws {HandFullError} If the hand is full.
   * @returns The drawn card.
   */
  public drawCard(): Card {
    const card = this.deck.getTopCard();
    if (!card) throw new EmptyDeckError();
    try {
      this.hand.push(card);
    } catch {
      throw new HandFullError();
    }
    return card;
  }

  public canPlayCard(card: Card): boolean {
    return this.mana >= card.cost;
  }

  public isMyTurn(): boolean {
    return this.game?.currentHero === this;
  }

  public playCard(card: MinionCard, options: {position: number}): boolean;
  public playCard(card: SpellCard, options: {target: Target}): boolean;
  public playCard(card: Card, options: Partial<{position: number; target: Target}>): boolean {
    if (!this.game) return false;
    //if (!this.hand.hasCard(card)) return false;
    //if (!this.isMyTurn()) return false;
    //if (!this.canPlayCard(card)) return false;
    this.mana -= card.cost;
    this.game.emit('cardPlayed', card, this);
    switch (card.type) {
      case 'minion':
        return this.#addMinion(card as MinionCard, options?.position);
      case 'spell':
        return this.game.castSpell(card as SpellCard, options?.target);
      default:
        throw new UnknownCardError();
    }
  }

  override hurt(amount: number) {
    super.hurt(amount);
    this.game?.emit('heroHurt', this);
  }

  override die() {
    super.die();
    this.game?.emit('heroDied', this);
  }

  #addMinion(card: MinionCard, position = 0): boolean {
    if (!this.game) return false;
    const minion = new Minion(card, this);
    minion.getCard().onUse(minion.context);
    this.board?.pushAt(position, minion);
    this.game.emit('minionAdded', minion);
    return true;
  }
}
