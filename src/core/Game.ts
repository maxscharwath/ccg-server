import Card from '@core/cards/Card';
import Minion from '@core/Minion';
import MinionCard from '@core/cards/MinionCard';
import SpellCard from '@core/cards/SpellCard';
import Player from '@core/Player';
import Target from '@core/Target';
import Board from '@core/Board';
import {EventEmitter} from '@studimax/event';

type GameEvents = {
  start: () => void;
  turn: (turn: number, player: Player) => void;
  round: (round: number) => void;
  skipTurn: (player: Player) => void;
  cardPlayed: (card: Card, player: Player) => void;
  minionAdded: (minion: Minion) => void;
  minionDied: (minion: Minion) => void;
};

export default class Game extends EventEmitter<GameEvents> {
  public turn = 0;
  public readonly players: [Player, Player];
  public readonly boards: [Board, Board] = [new Board(), new Board()];
  #turnTimer!: NodeJS.Timeout;
  #startAt = 0;

  constructor() {
    super();
    this.players = [new Player(), new Player()];
  }

  public get round(): number {
    return this.turn >> 1;
  }

  public get currentPlayer(): Player {
    return this.players[this.turn % 2];
  }

  public start() {
    this.#startAt = Date.now();
    this.#onMain();
  }

  #onMain() {
    this.emit('start');
    this.turn = -1;
    this.nextTurn();
  }

  #onTurn(player: Player) {
    clearTimeout(this.#turnTimer);
    this.#turnTimer = setTimeout(() => this.nextTurn(), 75_000);
    this.emit('turn', this.turn, player);
  }

  private nextTurn() {
    this.turn++;
    if (this.turn % 2 === 0) {
      this.emit('round', this.round);
    }
    this.#onTurn(this.currentPlayer);
  }

  public skipTurn() {
    this.emit('skipTurn', this.currentPlayer);
    setImmediate(() => this.nextTurn());
  }

  public playCard(card: Card, player: Player) {
    this.emit('cardPlayed', card, player);
    switch (card.type) {
      case 'minion':
        this.addMinion(card as MinionCard, player);
        break;
      case 'spell':
        this.castSpell(card as SpellCard, player);
        break;
      default:
        throw new Error('Unknown card type');
    }
  }

  private addMinion(card: MinionCard, player: Player) {
    const minion = new Minion(card);
    const index = this.players.findIndex(p => p === player);
    this.boards[index].push(minion);
    this.emit('minionAdded', minion);
  }

  private castSpell(card: SpellCard, target: Target): boolean {
    return card.onCast({
      target,
    });
  }
}
