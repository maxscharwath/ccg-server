/**
 * CardRarity
 */
export class CardRarity {
  static #VALUES: CardRarity[] = [];

  static COMMON = new CardRarity(1);
  static RARE = new CardRarity(0.3);
  static EPIC = new CardRarity(0.2);
  static LEGENDARY = new CardRarity(0.1);

  public readonly value: number;
  public name!: keyof typeof CardRarity;

  private constructor(value: number) {
    this.value = value;
    Object.defineProperty(this, 'name', {
      get: () => Object.entries(CardRarity).find(r => r[1] === this)![0],
      enumerable: true,
    });
    Object.freeze(this);
    CardRarity.#VALUES.push(this);
  }

  public static values(): CardRarity[] {
    return CardRarity.#VALUES;
  }

  public static valueOf(name: string): CardRarity | null {
    const names = Object.keys(this);
    for (let i = 0; i < names.length; i++) {
      if (this[names[i]] instanceof CardRarity && name.toLowerCase() === names[i].toLowerCase()) {
        return this[names[i]];
      }
    }
    return null;
  }

  public valueOf(): number {
    return this.value;
  }

  public toJSON(): string {
    return this.name;
  }
}
