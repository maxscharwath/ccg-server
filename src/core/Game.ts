import Card from '@core/cards/Card';
import Minion from '@core/Minion';
import SpellCard from '@core/cards/SpellCard';
import Hero from '@core/Hero';
import Target from '@core/Target';
import Board from '@core/Board';
import {EventEmitter} from '@studimax/event';
import {SubEventEmitter} from '@studimax/event/src';

type GameEvents = {
  start: () => void;
  end: () => void;
  turn: (turn: number, hero: Hero) => void;
  round: (round: number) => void;
  skipTurn: (hero: Hero) => void;
  cardPlayed: (card: Card, hero: Hero) => void;
  minionAdded: (minion: Minion) => void;
  minionDied: (minion: Minion) => void;
  minionHurt: (minion: Minion) => void;
  minionAttack: (minion: Minion, target: Target) => void;
  heroDied: (hero: Hero) => void;
  heroHurt: (hero: Hero) => void;
};

export class GameContext extends SubEventEmitter<GameEvents> {
  public readonly hero: Hero;

  get board(): Board {
    return <Board>this.hero.board;
  }

  protected constructor(game: Game, hero: Hero) {
    super(game);
    this.hero = hero;
  }

  static create<O extends Object>(game: Game, hero: Hero, options?: O): GameContext & O {
    return Object.assign(new GameContext(game, hero), options);
  }
}

export default class Game extends EventEmitter<GameEvents> {
  public turn = 0;
  public readonly heros: [Hero, Hero];
  public readonly boards = new WeakMap<Hero, Board>();
  #turnTimer!: NodeJS.Timeout;
  #startAt = 0;

  constructor() {
    super();
    this.heros = [new Hero(this), new Hero(this)];
    this.heros.forEach(hero => this.boards.set(hero, new Board()));
  }

  public get round(): number {
    return this.turn >> 1;
  }

  public get currentHero(): Hero {
    return this.heros[this.turn % 2];
  }

  public start() {
    this.emit('start');
    this.#startAt = Date.now();
    this.#onMain();
  }

  public end() {
    this.emit('end');
    clearTimeout(this.#turnTimer);
    this.removeAllListeners();
  }

  #onMain() {
    this.turn = -1;
    this.#nextTurn();
  }

  #onTurn(hero: Hero) {
    clearTimeout(this.#turnTimer);
    this.#turnTimer = setTimeout(() => this.#nextTurn(), 75_000);
    this.emit('turn', this.turn, hero);
  }

  #nextTurn() {
    this.turn++;
    if (this.turn % 2 === 0) {
      this.emit('round', this.round);
    }
    this.#onTurn(this.currentHero);
  }

  /**
   * Skip the current turn.
   */
  public skipTurn(): Promise<void> {
    return new Promise<void>(resolve => {
      setImmediate(async () => {
        this.emit('skipTurn', this.currentHero);
        await this.#nextTurn();
        resolve();
      });
    });
  }

  public castSpell(card: SpellCard, target?: Target): boolean {
    //todo : Probably not the best way to do this.
    return card.onCast(GameContext.create(this, this.currentHero, {target}));
  }
}
