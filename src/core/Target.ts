import * as crypto from 'crypto';
import Game from '@core/Game';

export default abstract class Target {
  public abstract health: number;
  public abstract attack: number;
  public game?: Game;
  readonly #uuid = crypto.randomUUID();

  protected constructor(game?: Game) {
    this.game = game;
  }

  public get uuid() {
    return this.#uuid;
  }

  public isDead(): boolean {
    return this.health <= 0;
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
