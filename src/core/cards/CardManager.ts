import * as fg from 'fast-glob';
import Card from '@core/cards/Card';
import {cardsDataFolder} from '@data/cards';
import {Log} from '@core/misc/Logger';

/**
 * Class CardManager is used to load and manage all the cards.
 * @remarks Cards are loaded from the cardsDataFolder. More than one card can be stored in the same file.
 */
export default class CardManager {
  private readonly cards = new Map<number, Readonly<Card>>();
  private loaded = false;

  async #loadFromFile(file: string): Promise<void> {
    const contents = await import(file);
    await Promise.allSettled(
      Object.entries<typeof Card>(contents).map(([key, CardClass]) =>
        (async () => this.addCard(CardClass))()
          .then(c => {
            Log.info(`Card ${c.getIdStr()} loaded from ${file}`);
            return c;
          })
          .catch((e: Error) => {
            Log.error(`Error while loading card ${key} from ${file}`, e.toString());
            throw e;
          })
      )
    );
  }

  /**
   * Load all the cards from the cardsDataFolder.
   */
  public async load(): Promise<void> {
    const files = await fg('**/*.(ts|js)', {
      ignore: ['index.(ts|js)'],
      cwd: cardsDataFolder,
      absolute: true,
    });
    await Promise.allSettled(
      files.map(file =>
        this.#loadFromFile(file).catch((e: Error) => {
          Log.error(`Error while loading file ${file}`, e.toString());
          throw e;
        })
      )
    );
    this.loaded = true;
  }

  /**
   * Add a card to the manager.
   * @param CardClass The class of the card to add.
   */
  public addCard<T extends typeof Card>(CardClass: T): Readonly<InstanceType<T>> {
    if (!((CardClass as unknown as ObjectConstructor).prototype instanceof Card)) {
      throw new Error(`${CardClass.name} is not a ${Card.name}`);
    }
    const card = Object.freeze(new (CardClass as unknown as ObjectConstructor)() as InstanceType<T>);
    if (this.cards.has(card.id)) {
      throw new Error(`There are already a card with this id (${card.id})`);
    }
    this.cards.set(card.id, card);
    return card;
  }

  /**
   * Verify if the card manager is loaded.
   */
  public isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get the number of cards loaded.
   */
  public countCards(): number {
    return this.cards.size;
  }

  /**
   * Get list of all the cards sorted by id.
   */
  public getCards(): Readonly<Card>[] {
    return [...this.cards.values()].sort((a, b) => a.id - b.id);
  }

  /**
   * Get list of all the cards sorted by id and filter by a instance of Card.
   * @param CardClass The class of the card to filter.
   */
  public getCardsByInstance<T extends typeof Card>(CardClass: T): Readonly<InstanceType<T>>[] {
    return this.getCards().filter(c => c instanceof CardClass) as Readonly<InstanceType<T>>[];
  }

  /**
   * Get a card by its id.
   * @remarks The returned card is readonly. {@link CardManager.getMutableCardById} is the recommended to getData a mutable card.
   * @param id The id of the card.
   * @throws RangeError if the card is not found.
   * @returns The card
   */
  public getCardById<T extends Card>(id: number): Readonly<T> {
    if (!this.cards.has(id)) {
      throw new RangeError(`Card with id ${id} not found`);
    }
    return this.cards.get(id) as T;
  }

  /**
   * Get a card by its id.
   * @remarks The returned card is mutable. {@link CardManager.getCardById} is the recommended to getData a readonly card.
   * @param id The id of the card.
   * @throws RangeError if the card is not found.
   * @returns The card
   */
  public getMutableCardById<T extends Card>(id: number): T {
    return this.getCardById(id).clone(false) as T;
  }

  /**
   * Return a mutable version of the card.
   * @param card The readonly card.
   * @returns The mutable card.
   */
  public getMutableCard<T extends Card>(card: Readonly<T> | T): T {
    return card.isReadonly() ? card.clone(false) : card;
  }

  /**
   * Verify if a card exists.
   * @param id The id of the card.
   */
  public hasCardId(id: number): boolean {
    return this.cards.has(id);
  }
}
