import CardManager from '../src/core/cards/CardManager';
import MinionCard from '../src/core/cards/MinionCard';
import Minion from '../src/core/Minion';

describe('Minion', () => {
  const cardManager = new CardManager();
  beforeAll(async () => {
    await cardManager.load();
  });
  test('Minion should be created from CardManager', () => {
    const minionCard = cardManager.getCardById<MinionCard>(0x0001);
    const minion = new Minion(minionCard);
    expect(minion).toBeDefined();
    expect(minion).toBeInstanceOf(Minion);
    expect(minion.attack).toBe(minionCard.attack);
    expect(minion.health).toBe(minionCard.health);
  });
  test('Minion Modifier should works', () => {
    const card = cardManager.getCardById<MinionCard>(0x0001);
    const minion = Minion.fromCard(card);
    expect(minion.applyModifier()).toStrictEqual({
      attack: card.attack,
      health: card.health,
    });
    minion.addModifier(modifier => ({
      attack: modifier.attack / 2,
      health: modifier.health + 2,
    }));
    minion.addModifier(modifier => ({
      health: modifier.health - 5,
    }));
    expect(minion.applyModifier()).toStrictEqual({
      attack: card.attack / 2,
      health: card.health + 2 - 5,
    });
  });
  test('Minion should attack and get damage', () => {
    const minionCard = cardManager.getCardById<MinionCard>(0x0001);
    const minionA = Minion.fromCard(minionCard);
    const minionB = Minion.fromCard(minionCard);
    minionA.attackTarget(minionB);
    expect(minionA.health).toBe(minionCard.health - minionCard.attack);
    expect(minionB.health).toBe(minionCard.health - minionCard.attack);
  });
});
