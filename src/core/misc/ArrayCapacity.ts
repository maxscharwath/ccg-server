/**
 * Class ArrayCapacity is an extended version of Array to limit the number of elements.
 * @remarks It uses Proxy to handle index access correctly. The capacity is readonly. It can be set only in the constructor.
 * @see Array
 * @see Proxy
 * @extends Array
 * @author Maxime Scharwath
 */
// @ts-expect-error Force to override static method from Array
export default class ArrayCapacity<T> extends Array<T> {
  /**
   * The maximum number of elements.
   * @readonly
   */
  public readonly capacity!: number;

  /**
   * Constructor of ArrayCapacity.
   * @param capacity The maximum number of elements.
   */
  constructor(capacity: number);
  /**
   * Constructor of ArrayCapacity.
   * @param capacity The maximum number of elements.
   * @param items The initial items.
   */
  constructor(capacity: number, ...items: T[]);
  constructor(capacity: number, ...items: T[]) {
    super(...items.slice(0, capacity));
    Object.defineProperty(this, 'capacity', {
      value: capacity,
      writable: false,
      enumerable: false,
      configurable: false,
    });
    //using Proxy to handle index accessor
    return new Proxy(this, {
      set: (target, key, value) => {
        const index = Number(key);
        if (Number.isNaN(index) || (index >= 0 && index < this.capacity)) {
          target[key] = value;
        }
        return true;
      },
    });
  }

  /**
   * Creates an ArrayCapacity from an array-like object and capacity.
   * @param arrayLike An array-like object to convert to an array.
   * @param capacity The maximum number of elements.
   * @returns A new ArrayCapacity instance.
   */
  public static override from<T>(arrayLike: ArrayLike<T>, capacity: number): ArrayCapacity<T> {
    return new ArrayCapacity<T>(capacity, ...Array.from(arrayLike));
  }

  /**
   * Returns a new ArrayCapacity from a set of elements and capacity.
   * @param capacity The maximum number of elements.
   * @param items A set of elements to include in the new ArrayCapacity object.
   * @returns A new ArrayCapacity instance.
   */
  public static override of<T>(capacity: number, ...items: T[]): ArrayCapacity<T> {
    return new ArrayCapacity<T>(capacity, ...items);
  }

  public override push(...items: T[]): number {
    return super.push(...items.slice(0, this.capacity - this.length));
  }

  public override unshift(...items: T[]): number {
    return super.unshift(...items.slice(0, this.capacity - this.length));
  }

  public pushAt(index: number, ...items: T[]): T[] {
    return this.splice(index, 0, ...items);
  }

  public override splice(start: number, deleteCount: number, ...items: T[]): T[] {
    return super.splice(start, deleteCount, ...items.slice(0, this.capacity - this.length + deleteCount));
  }

  /**
   * Takes an integer value and returns the item at that index, allowing for positive and negative integers. Negative integers count back from the last item in the array.
   * @throws RangeError if the index is out of range.
   * @param index The index to getData.
   * @returns The element at the specified index.
   */
  public at(index: number): T {
    if (index < 0) index = this.length + index;
    if (index < 0 || index >= this.capacity) throw new RangeError(`${index} is out the capacity of ${this.capacity}`);
    return this[index];
  }
}
