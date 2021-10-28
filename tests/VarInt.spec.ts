import VarInt from '@core/misc/VarInt';

describe('Array', () => {
  describe('encode', () => {
    test('1 varint should be encoded as [1]', () => {
      const {buffer, bytes} = VarInt.encode(1);
      expect(bytes).toBe(1);
      expect([1]).toEqual(expect.arrayContaining([...buffer]));
    });
    test('300 varint should be encoded as [172,2]', () => {
      const {buffer, bytes} = VarInt.encode(300);
      expect(bytes).toBe(2);
      expect([172, 2]).toEqual(expect.arrayContaining([...buffer]));
    });
    test('buffer and offset should works', () => {
      const buffer: number[] = [];
      let index = 0;
      index += VarInt.encode(300, buffer).bytes;
      index += VarInt.encode(100000, buffer, index).bytes;
      index += VarInt.encode(1, buffer, index).bytes;
      expect(index).toBe(6);
      expect([172, 2, 160, 141, 6, 1]).toEqual(expect.arrayContaining([...buffer]));
    });
  });

  describe('decode', () => {
    test('[1] should be decoded as 1', () => {
      const {value, bytes} = VarInt.decode([1]);
      expect(bytes).toBe(1);
      expect(value).toBe(1);
    });
    test('[172,2] should be decoded as 300', () => {
      const {value, bytes} = VarInt.decode([172, 2]);
      expect(bytes).toBe(2);
      expect(value).toBe(300);
    });
    test('buffer and offset should works', () => {
      const buffer = [172, 2, 160, 141, 6, 1];
      let index = 0;
      {
        const {value, bytes} = VarInt.decode(buffer, index);
        index += bytes;
        expect(bytes).toBe(2);
        expect(value).toBe(300);
      }
      {
        const {value, bytes} = VarInt.decode(buffer, index);
        index += bytes;
        expect(bytes).toBe(3);
        expect(value).toBe(100000);
      }
      {
        const {value, bytes} = VarInt.decode(buffer, index);
        index += bytes;
        expect(bytes).toBe(1);
        expect(value).toBe(1);
      }
      expect(() => VarInt.decode(buffer, index)).toThrow(RangeError);
    });
  });
});
