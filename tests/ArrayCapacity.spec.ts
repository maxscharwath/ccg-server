import ArrayCapacity from '@core/misc/ArrayCapacity';

describe('Array', () => {
  test('capacity should be the same as constructor args', () => {
    const array = new ArrayCapacity(2);
    expect(array.capacity).toBe(2);
    expect(array.length).toBe(0);
  });
  test('try to add value with indexer', () => {
    const array = new ArrayCapacity(2);
    array[0] = 1;
    array[1] = 2;
    array[2] = 3;
    expect(array.length).toBe(2);
    expect(array[2]).toBeUndefined();
  });
  test('try to add value with indexer out capacity', () => {
    const array = new ArrayCapacity(2);
    array[100] = 3;
    expect(array.length).toBe(0);
    expect(array[100]).toBeUndefined();
  });
  test('try push method', () => {
    const array = new ArrayCapacity(2);
    array.push(1, 2, 3);
    expect(array.length).toBe(2);
    expect(array[0]).toBe(1);
    expect(array[1]).toBe(2);
    expect(array[3]).toBeUndefined();
  });
  test('try unshift method', () => {
    const array = new ArrayCapacity(2);
    array.unshift(1, 2, 3);
    expect(array.length).toBe(2);
    expect(array[0]).toBe(1);
    expect(array[1]).toBe(2);
    expect(array[3]).toBeUndefined();
  });
  test('Array from', () => {
    const array = ArrayCapacity.from([1, 2, 3, 4], 2);
    expect(array).toBeInstanceOf(ArrayCapacity);
    expect(array.length).toBe(2);
    expect(ArrayCapacity.isArray(array)).toBeTruthy();
  });
  test('Array of', () => {
    const array = ArrayCapacity.of(2, ...[1, 2, 3, 4]);
    expect(array).toBeInstanceOf(ArrayCapacity);
    expect(array.length).toBe(2);
    expect(ArrayCapacity.isArray(array)).toBeTruthy();
  });
});
