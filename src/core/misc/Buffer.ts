import VarInt from '@core/misc/VarInt';

/** @internal */
class Iterator {
  #index = 0;

  /**
   * Get the current index
   */
  protected get index() {
    return this.#index;
  }

  /**
   * Increment the index with the given amount
   */
  protected next(nb = 1) {
    this.#index += nb;
  }
}

/**
 * Class BufferWriter generate a buffer encoded as varint
 * @see VarInt
 */
export class BufferWriter extends Iterator {
  readonly #buffer: number[] = [];

  /**
   * @returns The buffer as Buffer
   */
  public get buffer(): Buffer {
    return Buffer.from(this.#buffer);
  }

  /**
   * Write a zero in the buffer it will be encoded as varint
   * @returns The instance of the BufferWriter
   */
  public null(): this {
    this.#buffer[this.index] = 0;
    this.next();
    return this;
  }

  /**
   * Write a number in the buffer it will be encoded as varint
   * @param value The number to write
   * @returns The instance of the BufferWriter
   */
  public write(value: number): this {
    const {bytes} = VarInt.encode(value, this.#buffer, this.index);
    this.next(bytes);
    return this;
  }

  /**
   * Returns a string representation of an array.
   * @param encoding The encoding to use. Defaults to 'base64url'.
   * @returns The string representation of the array.
   */
  public override toString(encoding: BufferEncoding = 'base64url'): string {
    return this.buffer.toString(encoding);
  }
}

/**
 * Class BufferReader decode string to buffer encoded as varint
 * @see VarInt
 */
export class BufferReader extends Iterator {
  readonly #buffer: Buffer;

  /**
   * Constructor of the BufferReader
   * @param code The code to decode as Buffer
   * @param encoding The encoding to use. Defaults to 'base64url'.
   */
  constructor(code: string, encoding: BufferEncoding = 'base64url') {
    super();
    this.#buffer = Buffer.from(code, encoding);
  }

  /**
   * Read the next value in the buffer
   * @returns The number read
   */
  public nextByte(): number {
    const value = this.#buffer[this.index];
    this.next();
    return value;
  }

  /**
   * Read the next value in the buffer decoded as varint
   * @returns The number read
   */
  public nextVarint(): number {
    const {bytes, value} = VarInt.decode(this.#buffer, this.index);
    this.next(bytes);
    return value;
  }
}
