import Deck from '@core/deck/Deck';
import Hand from '@core/hand/Hand';
import Target from '@core/Target';
import Game from '@core/Game';
import Card from '@core/cards/Card';
import {EmptyDeckError, HandFullError, UnknownCardError} from '@core/error/errors';
import MinionCard from '@core/cards/MinionCard';
import SpellCard from '@core/cards/SpellCard';
import Board from '@core/Board';
import Minion from '@core/Minion';

export default class Hero extends Target {
  public readonly deck: Deck;
  public readonly hand: Hand = new Hand();
  public health = 30;
  public attack = 0;
  public mana = 0;

  get board(): Board | undefined {
    return this.game?.boards.get(this);
  }

  constructor(game?: Game) {
    super(game);
    this.deck = new Deck();
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

  public playCard(card: MinionCard, options: {position: number}): void;
  public playCard(card: SpellCard, options: {target: Target}): void;
  public playCard(card: Card, options: Partial<{position: number; target: Target}>): void {
    if (!this.hand.hasCard(card) || !this.game) return;
    this.game.emit('cardPlayed', card, this);
    switch (card.type) {
      case 'minion':
        this.#addMinion(card as MinionCard, options?.position);
        break;
      case 'spell':
        this.game.castSpell(card as SpellCard, options?.target);
        break;
      default:
        throw new UnknownCardError();
    }
  }

  #addMinion(card: MinionCard, position = 0) {
    if (!this.game) return;
    const minion = new Minion(card, this.game);
    this.board?.pushAt(position, minion);
    this.game.emit('minionAdded', minion);
  }

  override hurt(amount: number) {
    super.hurt(amount);
    this.game?.emit('heroHurt', this);
  }

  override die() {
    super.die();
    this.game?.emit('heroDied', this);
  }
}
