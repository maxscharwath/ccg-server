import Minion from '@core/Minion';
import ArrayCapacity from '@studimax/array-capacity';

export default class Board extends ArrayCapacity<Minion> {
  static readonly #MAX_MINIONS = 7;

  constructor() {
    super({
      capacity: Board.#MAX_MINIONS,
    });
  }

  public getAdjacent(index: number): Minion[] {
    const minions = [];
    if (this[index - 1]) minions.push(this[index - 1]);
    if (this[index + 1]) minions.push(this[index + 1]);
    return minions;
  }

  public getAdjacentMinions(minion: Minion): Minion[] {
    const index = this.indexOf(minion);
    return index === -1 ? [] : this.getAdjacent(index);
  }

  public getRandom(): Minion {
    return this[Math.floor(Math.random() * this.length)];
  }

  public remove(minion: Minion): boolean {
    const index = this.indexOf(minion);
    if (index === -1) return false;
    this.splice(index, 1);
    return true;
  }
}
