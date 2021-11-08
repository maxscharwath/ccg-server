import ArrayCapacity from '@core/misc/ArrayCapacity';
import Minion from '@core/Minion';

export default class Board extends ArrayCapacity<Minion> {
  static readonly #MAX_MINIONS = 7;
  constructor() {
    super(Board.#MAX_MINIONS);
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
}
