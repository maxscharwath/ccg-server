type Options = {
  initialRating: number;
  kFactor: number;
};

export default class Elo {
  static #PERF = 400;
  readonly #kFactor: number;
  readonly #initialRating: number;

  constructor(options: Partial<Options> = {}) {
    this.#kFactor = options.kFactor ?? 32;
    this.#initialRating = options.initialRating ?? 1000;
  }

  public getInitialRating(): number {
    return this.#initialRating;
  }

  public getKFactor(): number {
    return this.#kFactor;
  }

  /**
   * Calculates the probability to win based on the rating of the opponent.
   * @param Ra Elo rating of the player A.
   * @param Rb Elo rating of the player B.
   */
  public calculatePerformance(Ra: number, Rb: number): {Ea: number; Eb: number} {
    return {
      Ea: 1 / (1 + 10 ** ((Rb - Ra) / Elo.#PERF)),
      Eb: 1 / (1 + 10 ** ((Ra - Rb) / Elo.#PERF)),
    };
  }
  /**
   * Calculates the expected score of a player based on the rating of the other player.
   * @param Ra Elo rating of the player A.
   * @param Rb Elo rating of the player B.
   * @param S Expected score of player A. (0 <= S <= 1)
   */
  public calculateRating(Ra: number, Rb: number, S = 1): {Rb: number; Ra: number} {
    const {Ea, Eb} = this.calculatePerformance(Ra, Rb);
    S = Math.min(Math.max(S, 0), 1);
    return {
      Ra: Ra + this.#kFactor * (S - Ea),
      Rb: Rb + this.#kFactor * (1 - S - Eb),
    };
  }
}
