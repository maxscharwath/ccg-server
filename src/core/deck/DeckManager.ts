import {CardId} from '@core/cards/Card';
import {BufferReader, BufferWriter} from '@core/misc/Buffer';
import Deck from '@core/deck/Deck';
import CardManager from '@core/cards/CardManager';

/**
 * CardTuple represent a tuple of card and occurrence
 */
export type CardTuple = [CardId, number];

export default class DeckManager {
  static readonly VERSION = 0x1;

  static fromCode(code: string, cardManager: CardManager): Deck {
    return this.parse(code).reduce((deck, cardTuple) => {
      const [cardId, occurrence] = cardTuple;
      for (let i = 0; i < occurrence; i++) {
        if (cardManager.hasCardId(cardId)) {
          deck.push(cardManager.getMutableCardById(cardId));
        }
      }
      return deck;
    }, new Deck());
  }

  /**
   * Stringify cards to base64 string
   * @version 1
   * @param cards
   */
  public static stringify(cards: CardId[]): string {
    const writer = new BufferWriter();
    writer.null().write(this.VERSION);
    const sortedCards = DeckManager.#sort(cards);
    writer.write(sortedCards.length);
    for (const [card, count] of sortedCards) {
      writer.write(card).write(count);
    }
    writer.null();
    return writer.toString();
  }

  /**
   * Parse base64 string to cards
   * @version 1
   * @param code
   */
  static parse(code: string): CardTuple[] {
    const reader = new BufferReader(code);
    if (reader.nextByte() !== 0) {
      throw new Error('Invalid code');
    }
    const version = reader.nextVarint();
    if (version !== this.VERSION) {
      throw new Error(`Unsupported code version ${version}`);
    }
    const cards: CardTuple[] = [];
    const nbCards = reader.nextVarint();
    for (let i = 0; i < nbCards; i++) {
      cards.push([reader.nextVarint(), reader.nextVarint()]);
    }
    return cards;
  }

  /**
   * Sort cards to array of CardTuple
   * @param cards
   * @return CardTuple[]
   * @private
   */
  static #sort(cards: CardId[]): CardTuple[] {
    const map = new Map<number, number>();
    cards.forEach(card => map.set(card, (map.get(card) ?? 0) + 1));
    return [...map].sort((a, b) => a[0] - b[0]);
  }
}
