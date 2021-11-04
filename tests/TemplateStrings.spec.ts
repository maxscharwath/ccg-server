import TemplateStrings from '../src/core/misc/TemplateStrings';

describe('TemplateStrings', () => {
  it('should return the correct string', () => {
    expect(TemplateStrings('Hello {world} !', {world: 'World'})).toBe('Hello World !');
    expect(TemplateStrings('Hello {world} !', {})).toBe('Hello {world} !');
    expect(TemplateStrings('Hello {world.planet} !', {planet: 'World'})).toBe('Hello {world.planet} !');
    expect(
      TemplateStrings('{a.huge.hello} {a.big.world} !', {a: {huge: {hello: 'Hello'}, big: {world: 'World'}}})
    ).toBe('Hello World !');
  });
});
