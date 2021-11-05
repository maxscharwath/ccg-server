import I18N from '../src/core/misc/I18N';

describe('Test I18N class', () => {
  const i18n = new I18N('./tests/locales/', 'en-us');
  beforeAll(async () => {
    await i18n.load();
  });
  test('getCatalog() should return an array of locales', () => {
    expect(['en-us', 'fr-fr']).toEqual(expect.arrayContaining(i18n.getCatalog()));
  });
  test('setLocale() & getLocale()', () => {
    expect(i18n.getLocale()).toBe('en-us');
    expect(i18n.setLocale('de-de')).toBe('en-us');
    expect(i18n.getLocale()).toBe('en-us');
    expect(i18n.setLocale('fr_FR')).toBe('fr-fr');
    expect(i18n.getLocale()).toBe('fr-fr');
  });
  test('t()', () => {
    i18n.setLocale('en-us');
    expect(i18n.t('test.hello')).toBe('World');
  });
});
