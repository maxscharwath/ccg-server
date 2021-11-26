const VALUES: CardRarity[] = [];
export class CardRarity {
  public static COMMON: CardRarity = CardRarity.#create(1);
  public static RARE = CardRarity.#create(0.3);
  public static EPIC = CardRarity.#create(0.2);
  public static LEGENDARY = CardRarity.#create(0.1);
  /**
   * Returns rarity value
   */
  public readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  /**
   * Returns rarity name
   */
  public get name(): string {
    return Object.entries(CardRarity).find(r => r[1] === this)![0];
  }

  /**
   * Returns all available rarities.
   */
  public static values(): CardRarity[] {
    return VALUES;
  }

  /**
   * Returns the rarity with the given name.
   * @param name {string} The name of the rarity.
   * @returns {CardRarity|null} The rarity with the given name.
   */
  public static valueOf(name: string): CardRarity | null {
    const names = Object.keys(this);
    for (let i = 0; i < names.length; i++) {
      if (this[names[i]] instanceof CardRarity && name.toLowerCase() === names[i].toLowerCase()) {
        return this[names[i]];
      }
    }
    return null;
  }

  /**
   * Creates a new rarity and adds it to the list of available rarities.
   * @returns {CardRarity} The new rarity.
   * @param args
   */
  static #create(...args: ConstructorParameters<typeof CardRarity>): Readonly<CardRarity> {
    const frozen = Object.freeze(new CardRarity(...args));
    VALUES.push(frozen);
    return frozen;
  }

  /**
   * Returns rarity value
   */
  public valueOf(): number {
    return this.value;
  }

  public toJSON(): string {
    return this.name;
  }
}
