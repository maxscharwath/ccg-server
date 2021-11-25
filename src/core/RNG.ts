export class Seed {
  public static from(str: string | number = Math.random()): number {
    if (Number.isInteger(Number(str))) {
      return Number(str);
    }
    str = str.toString();
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h;
  }
}

export default class RNG {
  #seed: number;

  constructor(seed?: string | number) {
    this.#seed = Seed.from(seed);
  }

  #next(): number {
    let t = (this.#seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public float(): number;
  public float(max: number): number;
  public float(min: number, max: number): number;
  public float(num1 = 1, num2?: number): number {
    if (num2 === undefined) {
      num2 = num1;
      num1 = 0;
    }
    return this.#next() * (num2 - num1 + 1) + num1;
  }

  public int(max: number): number;
  public int(min: number, max: number): number;
  public int(num1: number, num2?: number): number {
    if (num2 === undefined) {
      num2 = num1;
      num1 = 0;
    }
    return Math.floor(this.#next() * (num2 - num1 + 1)) + num1;
  }

  public bool(): boolean {
    return this.#next() > 0.5;
  }

  public probability(probability: number): boolean {
    return this.#next() < probability;
  }

  public gaussian(): number {
    const u = 2 * this.#next() - 1;
    const v = 2 * this.#next() - 1;
    const r = u * u + v * v;
    if (r === 0 || r > 1) return this.gaussian();
    const c = Math.sqrt((-2 * Math.log(r)) / r);
    return u * c;
  }

  public shuffle<T>(array: T[]): T[] {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.#next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  public random(number = 1): number {
    return this.#next() * number;
  }
}
