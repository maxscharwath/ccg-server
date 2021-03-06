import * as fg from 'fast-glob';
import Card, {CardId} from '@core/cards/Card';
import {cardsDataFolder} from '@data/cards';
import {Log} from '@studimax/logger';
import {CardIdAlreadyExistsError, NotACardError} from '@core/error/errors';

export type ReadonlyCard<T extends Card> = Readonly<T> & T;
/**
 * Class CardManager is used to load and manage all the cards.
 * @remarks Cards are loaded from the cardsDataFolder. More than one card can be stored in the same file.
 */
export default class CardManager {
  readonly #cards = new Map<CardId, ReadonlyCard<Card>>();
  #loaded = false;

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
    this.#loaded = true;
  }

  /**
   * Add a card to the manager.
   * @param CardClass The class of the card to add.
   */
  public addCard<T extends typeof Card>(CardClass: T): ReadonlyCard<InstanceType<T>> {
    if (!((CardClass as unknown as ObjectConstructor).prototype instanceof Card)) {
      throw new NotACardError(CardClass.name);
    }
    const card = Object.freeze(new (CardClass as unknown as ObjectConstructor)()) as ReadonlyCard<InstanceType<T>>;
    if (this.#cards.has(card.id)) {
      throw new CardIdAlreadyExistsError(card.id);
    }
    this.#cards.set(card.id, card);
    return card as ReadonlyCard<InstanceType<T>>;
  }

  /**
   * Verify if the card manager is loaded.
   */
  public isLoaded(): boolean {
    return this.#loaded;
  }

  /**
   * Get the number of cards loaded.
   */
  public countCards(): number {
    return this.#cards.size;
  }

  /**
   * Get list of all the cards sorted by id.
   */
  public getCards(): ReadonlyCard<Card>[] {
    return [...this.#cards.values()].sort((a, b) => a.id - b.id);
  }

  /**
   * Get list of all the cards sorted by id and filter by a instance of Card.
   * @param CardClass The class of the card to filter.
   */
  public getCardsByInstance<T extends typeof Card>(CardClass: T): ReadonlyCard<InstanceType<T>>[] {
    return this.getCards().filter(c => c instanceof CardClass) as ReadonlyCard<InstanceType<T>>[];
  }

  /**
   * Get a card by its id.
   * @remarks The returned card is readonly. {@link CardManager.getMutableCardById} is the recommended to getData a mutable card.
   * @param id The id of the card.
   * @throws RangeError if the card is not found.
   * @returns The card
   */
  public getCardById<T extends Card>(id: CardId): ReadonlyCard<T> {
    if (!this.#cards.has(id)) {
      throw new RangeError(`Card with id ${id} not found`);
    }
    return this.#cards.get(id) as T;
  }

  /**
   * Get a card by its id.
   * @remarks The returned card is mutable. {@link CardManager.getCardById} is the recommended to getData a readonly card.
   * @param id The id of the card.
   * @throws RangeError if the card is not found.
   * @returns The card
   */
  public getMutableCardById<T extends Card>(id: CardId): T {
    return this.getCardById(id).clone(false) as T;
  }

  /**
   * Return a mutable version of the card.
   * @param card The readonly card.
   * @returns The mutable card.
   */
  public getMutableCard<T extends Card>(card: ReadonlyCard<T> | T): T {
    return card.isReadonly() ? card.clone(false) : card;
  }

  /**
   * Verify if a card exists.
   * @param id The id of the card.
   */
  public hasCardId(id: CardId): boolean {
    return this.#cards.has(id);
  }

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
}
