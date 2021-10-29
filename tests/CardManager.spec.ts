import CardManager from '@core/cards/CardManager';
import Card, {CardRarity} from '../src/core/cards/Card';
import MinionCard from '../src/core/cards/MinionCard';
import SpellCard from '../src/core/cards/SpellCard';

describe('CardManager', () => {
  test('should be a class', () => {
    expect(typeof CardManager).toBe('function');
  });
  test('should be instantiable', () => {
    expect(new CardManager()).toBeInstanceOf(CardManager);
  });
  test('should load cards correctly from folder', async () => {
    const cardManager = new CardManager();
    expect(cardManager.countCards()).toBe(0);
    await cardManager.load();
    expect(cardManager.countCards()).toBeGreaterThan(0);
    expect(cardManager.getCards()[0]).toBeInstanceOf(Card);
  });
  test('should add Card', async () => {
    const cardManager = new CardManager();
    expect(cardManager.countCards()).toBe(0);
    class TestSpellCard extends SpellCard {
      cost = 2;
      id = 1;
      name = 'TestCard';
      rarity = CardRarity.RARE;
      text = 'TestCard description';
    }
    const card = cardManager.addCard(TestSpellCard);
    expect(card).toBeInstanceOf(Card);
    expect(card).toBeInstanceOf(TestSpellCard);
    expect(() => cardManager.addCard(TestSpellCard)).toThrow();
    expect(cardManager.countCards()).toBe(1);
  });
  test('should not add Card', async () => {
    const cardManager = new CardManager();
    expect(() => cardManager.addCard(class Test {} as never)).toThrow();
    expect(() => cardManager.addCard(null as never)).toThrow();
    expect(() => cardManager.addCard('' as never)).toThrow();
    expect(() => cardManager.addCard(12 as never)).toThrow();
    expect(cardManager.countCards()).toBe(0);
  });
  describe('some deeper tests', () => {
    const cardManager = new CardManager();
    beforeAll(async () => {
      cardManager.addCard(
        class TestCard extends MinionCard {
          attack = 1;
          cost = 2;
          health = 3;
          id = 1;
          name = 'TestCard';
          rarity = CardRarity.RARE;
          text = 'TestCard description';
        }
      );
      expect(cardManager.countCards()).toBe(1);
    });
    test('should get a cards by id', () => {
      const card = cardManager.getCardById<MinionCard>(1);
      expect(card).toBeInstanceOf(Card);
      expect(card).toBeInstanceOf(MinionCard);
    });
    test('should be readonly', () => {
      const card = cardManager.getCardById<MinionCard>(1) as MinionCard;
      expect(() => (card.health = 0)).toThrow();
    });
    test('should be mutable', () => {
      const card = cardManager.getMutableCardById<MinionCard>(1);
      expect(() => (card.health = 0)).not.toThrow();
      expect(card.health).toBe(0);
    });
    test('should', () => {
      cardManager.getCardsByInstance(MinionCard).forEach(card => {
        expect(card).toBeInstanceOf(MinionCard);
      });
      expect(cardManager.getCardsByInstance(MinionCard)).toHaveLength(1);
      expect(cardManager.getCardsByInstance(SpellCard)).toHaveLength(0);
    });
  });
});