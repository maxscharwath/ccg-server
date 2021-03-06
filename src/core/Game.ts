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
  endTurn: (turn: number, hero: Hero) => void;
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
  public readonly opponent: Hero;
  readonly #game: Game;

  protected constructor(game: Game, hero: Hero) {
    super(game);
    this.#game = game;
    if (game.heroes[0] === hero) {
      this.hero = game.heroes[0];
      this.opponent = game.heroes[1];
    } else {
      this.hero = game.heroes[1];
      this.opponent = game.heroes[0];
    }
  }

  static create<O extends Object>(game: Game, hero: Hero, options?: O): GameContext & O {
    return Object.assign(new GameContext(game, hero), options);
  }

  public isGame(game: Game): boolean {
    return this.#game === game;
  }
}

export default class Game extends EventEmitter<GameEvents> {
  public turn = 0;
  public readonly heroes: [Hero, Hero];
  public readonly boards = new WeakMap<Hero, Board>();
  #turnTimer!: NodeJS.Timeout;
  #startAt = 0;

  constructor() {
    super();
    this.heroes = [new Hero(this), new Hero(this)];
    this.heroes.forEach(hero => this.boards.set(hero, new Board()));
  }

  public get round(): number {
    return this.turn >> 1;
  }

  public get currentHero(): Hero {
    return this.heroes[this.turn % 2];
  }

  public start() {
    this.emit('start');
    this.#startAt = Date.now();
    this.#onMain();
  }

  public end() {
    this.emit('end');
    clearTimeout(this.#turnTimer);
    this.removeAllChildrenListeners();
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

  #onMain() {
    this.turn = -1;
    this.#nextTurn();
  }

  #onTurn(hero: Hero) {
    clearTimeout(this.#turnTimer);
    this.#turnTimer = setTimeout(() => this.#nextTurn(), 75_000);
    hero.mana = ++hero.availableMana;
    this.emit('turn', this.turn, hero);
  }

  #nextTurn() {
    this.emit('endTurn', this.turn, this.currentHero);
    this.turn++;
    if (this.turn % 2 === 0) {
      this.emit('round', this.round);
    }
    this.#onTurn(this.currentHero);
  }
}
