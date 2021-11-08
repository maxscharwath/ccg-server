import Deck from '@core/deck/Deck';
import Hand from '@core/hand/Hand';
import Target from '@core/Target';

export default class Player extends Target {
  public readonly deck: Deck;
  public readonly hand: Hand = new Hand();
  public health = 30;
  public attack = 0;
  public mana = 0;

  constructor() {
    super();
    this.deck = new Deck();
  }
}
