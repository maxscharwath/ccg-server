import Deck from '@core/deck/Deck';
import Hand from '@core/hand/Hand';
import Target from '@core/Target';
import Game from '@core/Game';
import Card from '@core/cards/Card';
import {EmptyDeckError, HandFullError} from '@core/error/errors';

export default class Player extends Target {
  public readonly deck: Deck;
  public readonly hand: Hand = new Hand();
  public health = 30;
  public attack = 0;
  public mana = 0;

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

  public playCard(card: Card) {
    if (this.hand.hasCard(card)) this.game?.playCard(card, this);
  }
}
