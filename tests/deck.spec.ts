import DeckManager from '../src/core/deck/DeckManager';

describe('Deck tests', () => {
  test('stringify', async () => {
    const cards = [12, 12, 15, 15, 45, 45, 85, 85, 651, 651, 152, 152, 1, 2, 1, 555, 652];
    const code = DeckManager.stringify(cards);
    expect(code).toBe('AAEKAQICAQwCDwItAlUCmAECqwQBiwUCjAUBAA');
    expect(cards).toEqual(
      expect.arrayContaining(
        DeckManager.parse(code).reduce((acc: number[], [card, count]) => [...acc, ...Array(count).fill(card)], [])
      )
    );
  });
});
