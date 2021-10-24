// @ts-expect-error Force to override static method from Array
export default class ArrayCapacity<T> extends Array<T> {
  static override from<T>(
    arrayLike: ArrayLike<T>,
    capacity: number
  ): ArrayCapacity<T> {
    return new ArrayCapacity<T>(capacity, ...Array.from(arrayLike));
  }

  static override of<T>(capacity: number, ...items: T[]): ArrayCapacity<T> {
    return new ArrayCapacity<T>(capacity, ...items);
  }

  public readonly capacity: number;
  constructor(capacity: number, ...items: T[]) {
    super(...items.slice(0, capacity));
    this.capacity = capacity;
    //using Proxy to handle index accessor
    return new Proxy(this, {
      set: (target, key, value) => {
        const index = Number(key);
        if (Number.isNaN(index) || index < this.capacity) {
          target[key] = value;
        }
        return true;
      },
    });
  }

  override push(...items: T[]): number {
    return super.push(...items.slice(0, this.capacity - this.length));
  }

  override unshift(...items: T[]): number {
    return super.unshift(...items.slice(0, this.capacity - this.length));
  }

  override splice(start: number, deleteCount: number, ...items: T[]): T[] {
    return super.splice(
      start,
      deleteCount,
      ...items.slice(0, this.capacity - this.length + deleteCount)
    );
  }

  /**
   * @throws RangeError
   * @param index
   */
  public at(index: number): T {
    if (index < 0 || index >= this.capacity)
      throw new RangeError(`${index} is out the capacity of ${this.capacity}`);
    return this[index];
  }
}
