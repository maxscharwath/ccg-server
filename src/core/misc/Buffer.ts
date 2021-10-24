import VarInt from '@core/misc/VarInt';

/** @internal */
class Iterator {
  #index = 0;

  protected get index() {
    return this.#index;
  }

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

  get buffer(): Buffer {
    return Buffer.from(this.#buffer);
  }

  public null(): this {
    this.#buffer[this.index] = 0;
    this.next();
    return this;
  }

  public write(value: number): this {
    const {bytes} = VarInt.encode(value, this.#buffer, this.index);
    this.next(bytes);
    return this;
  }

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

  constructor(code: string, encoding: BufferEncoding = 'base64url') {
    super();
    this.#buffer = Buffer.from(code, encoding);
  }

  public nextByte(): number {
    const value = this.#buffer[this.index];
    this.next();
    return value;
  }

  public nextVarint(): number {
    const {bytes, value} = VarInt.decode(this.#buffer, this.index);
    this.next(bytes);
    return value;
  }
}
