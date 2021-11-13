import Game from '../src/core/Game';
import {EmptyDeckError} from '../src/core/error/errors';
import {ok} from 'assert';

describe('Test Game', () => {
  it('should create an instance', () => {
    const game = new Game();
    expect(game).toBeInstanceOf(Game);
  });
  it('should game emit start on start', done => {
    const game = new Game();
    game.on('start', () => done());
    game.start();
  });
  it('should game emit end on end', done => {
    const game = new Game();
    game.on('end', () => done());
    game.end();
  });
  it('should throw an error', () => {
    const game = new Game();
    expect(() => game.currentPlayer.drawCard()).toThrow(EmptyDeckError);
  });
  it('Next turn should switch current player', async () => {
    const game = new Game();
    const player1 = game.currentPlayer;
    await game.skipTurn();
    const player2 = game.currentPlayer;
    game.end();
    ok(player1 !== player2);
  });
});
