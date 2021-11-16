import Game from '../src/core/Game';
import {EmptyDeckError} from '../src/core/error/errors';
import {ok} from 'assert';
import CardManager from '../src/core/cards/CardManager';
import MinionCard, {MinionGameContext} from '../src/core/cards/MinionCard';
import {CardRarity} from '../src/core/cards/Card';
import Minion from '../src/core/Minion';

describe('Test Game', () => {
  it('should create an instance', () => {
    const game = new Game();
    expect(game).toBeInstanceOf(Game);
    game.end();
  });
  it('should game emit start on start', done => {
    const game = new Game();
    game.on('start', () => done());
    game.start();
    game.end();
  });
  it('should game emit end on end', done => {
    const game = new Game();
    game.on('end', () => done());
    game.end();
  });
  it('should throw an error', () => {
    const game = new Game();
    expect(() => game.currentHero.drawCard()).toThrow(EmptyDeckError);
    game.end();
  });
  it('Next turn should switch current hero', async () => {
    const game = new Game();
    const hero1 = game.currentHero;
    await game.skipTurn();
    const hero2 = game.currentHero;
    ok(hero1 !== hero2);
    game.end();
  });

  describe('play card', () => {
    it('should play a card', async () => {
      const game = new Game();
      const spy = jest.fn();
      const cardManager = new CardManager();
      cardManager.addCard(
        class TestCard extends MinionCard {
          public id = 1;
          public attack = 8;
          public cost = 9;
          public health = 8;
          public tag = 'test-card';
          public rarity = CardRarity.LEGENDARY;

          override onUse(context: MinionGameContext) {
            spy();
            context.minion.attack += 2;
            context.minion.health += 1;
          }
        }
      );
      const hero = game.currentHero;
      hero.hand.pushAt(0, cardManager.getMutableCardById(1));
      const card = hero.hand.at<MinionCard>(0);
      expect(hero.playCard(card, {position: 0})).toBe(true);
      const minion = hero.board?.at(0);
      expect(minion).toBeInstanceOf(Minion);
      expect(minion?.getCard()).toBe(card);
      expect(minion?.attack).toBe(10);
      expect(minion?.health).toBe(9);
      expect(spy).toHaveBeenCalledTimes(1);
      game.end();
    });
  });
});
