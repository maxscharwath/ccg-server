import Game from '../src/core/Game';
import {EmptyDeckError} from '../src/core/error/errors';
import {ok} from 'assert';

describe('Test Game', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game();
  });
  afterEach(() => {
    game.end();
  });
  it('should create an instance', () => {
    expect(game).toBeInstanceOf(Game);
    game.end();
  });
  it('should game emit start on start', done => {
    game.on('start', () => done());
    game.start();
  });
  it('should game emit end on end', done => {
    game.on('end', () => done());
    game.end();
  });
  it('should throw an error', () => {
    expect(() => game.currentHero.drawCard()).toThrow(EmptyDeckError);
  });
  it('Next turn should switch current hero', async () => {
    const hero1 = game.currentHero;
    await game.skipTurn();
    const hero2 = game.currentHero;
    ok(hero1 !== hero2);
  });
});
