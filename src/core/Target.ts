import * as crypto from 'crypto';
import Game from '@core/Game';

export default abstract class Target {
  public abstract health: number;
  public abstract attack: number;
  readonly #uuid = crypto.randomUUID();
  public game?: Game;

  protected constructor(game?: Game) {
    this.game = game;
  }

  public get uuid() {
    return this.#uuid;
  }

  public attackTarget(target: Target) {
    target.hurt(this.attack);
    this.hurt(target.attack);
  }

  public hurt(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  public die() {}
}
