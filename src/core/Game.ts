import {EventEmitter} from '@core/misc/Event';
import Card from '@core/cards/Card';
import Minion from '@core/Minion';

//todo
type Player = string;

type GameEvents = {
  start: () => void;
  turn: (player: Player) => void;
  round: () => void;
  cardPlayed: (card: Card, player: Player) => void;
  minionDied: (minion: Minion) => void;
};

export default class Game extends EventEmitter<GameEvents> {
  public turn = 0;
  public players: [Player, Player];
  #turnTimer!: NodeJS.Timeout;
  private startAt = 0;

  constructor(...players: [Player, Player]) {
    super();
    this.players = players;
  }

  public start() {
    this.startAt = Date.now();
    this.#onMain();
  }

  #onMain() {
    this.emit('start');
    this.#onTurn(this.currentPlayer);
  }

  #onTurn(player: Player) {
    clearTimeout(this.#turnTimer);
    this.#turnTimer = setTimeout(() => this.nextTurn(), 2_000);
    this.emit('turn', player);
  }

  private nextTurn() {
    this.turn++;
    if (this.turn % 2 === 0) {
      this.emit('round');
    }
    this.#onTurn(this.currentPlayer);
  }

  private get currentPlayer(): Player {
    return this.players[this.turn % 2];
  }

  public get round(): number {
    return this.turn >> 1;
  }
}
