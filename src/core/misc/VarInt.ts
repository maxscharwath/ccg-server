const MSB = 0x80,
  REST = 0x7f,
  MSBALL = ~REST,
  INT = 2 ** 31;

/**
 * Writes a varint to the buffer
 * @param value The value to read
 * @param buffer The buffer to write to
 * @param offset The offset to start writing at
 * @returns bytes written and buffer
 */
function encode(value: number, buffer: number[] = [], offset = 0): {bytes: number; buffer: Uint8Array} {
  const tmpOffset = offset;
  while (value >= INT) {
    buffer[offset++] = (value & 0xff) | MSB;
    value /= 128;
  }
  while (value & MSBALL) {
    buffer[offset++] = (value & 0xff) | MSB;
    value >>>= 7;
  }
  buffer[offset] = value | 0;
  return {
    buffer: Uint8Array.from(buffer),
    bytes: offset - tmpOffset + 1,
  };
}

/**
 * Reads a varint from the buffer
 * @param buffer The buffer to read from
 * @param offset The offset to start reading from
 * @returns value and bytes read
 */
function decode(buffer: number[] | Uint8Array, offset = 0): {bytes: number; value: number} {
  let res = 0,
    shift = 0,
    counter = offset,
    b;
  do {
    if (counter >= buffer.length || shift > 49) {
      throw new RangeError('Could not decode varint');
    }
    b = buffer[counter++];
    res += shift < 28 ? (b & REST) << shift : (b & REST) * 2 ** shift;
    shift += 7;
  } while (b >= MSB);
  return {
    value: res,
    bytes: counter - offset,
  };
}

/**
 * Implementation of protocol-buffers varint
 * @see https://developers.google.com/protocol-buffers/docs/encoding#varints
 */
export default {
  encode,
  decode,
};
