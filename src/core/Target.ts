import * as crypto from 'crypto';

export default abstract class Target {
  public abstract health: number;
  public abstract attack: number;
  readonly #uuid = crypto.randomUUID();

  public get uuid() {
    return this.#uuid;
  }

  public attackTarget(target: Target) {
    target.hurt(this.attack);
    this.hurt(target.attack);
  }

  public hurt(amount: number) {
    this.health -= amount;
  }
}
