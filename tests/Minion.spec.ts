import CardManager from '../src/core/cards/CardManager';
import Minion from '../src/core/Minion';
import MinionCard from '../src/core/cards/MinionCard';

describe('Minion', () => {
  const cardManager = new CardManager();
  beforeAll(async () => {
    await cardManager.load();
  });
  test('create', () => {
    const card = cardManager.getCardById<MinionCard>(0x0001);
    if (!card) throw new Error('Cannot find the card');
    const minion = Minion.fromCard(card);
    expect(minion).toBeInstanceOf(Minion);
    expect(minion.attack).toBe(card.attack);
    expect(minion.health).toBe(card.health);
    console.log(minion.applyModifier());
    minion.addModifier(
      modifier => ({
        attack: modifier.attack / 2,
        health: modifier.health + 2,
      }),
      modifier => ({
        health: modifier.health - 5,
      })
    );
    console.log(minion.applyModifier());
  });
});
