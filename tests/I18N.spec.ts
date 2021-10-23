import I18N from '@core/misc/I18N';

describe('Test I18N class', () => {
  const i18n = new I18N('./tests/locales/');
  beforeAll(async () => {
    await i18n.load();
  });
  test('getCatalog() should return an array of locales', () => {
    expect(['en_US', 'fr_FR']).toEqual(
      expect.arrayContaining(i18n.getCatalog())
    );
  });
  test('setLocale() & getLocale()', () => {
    expect(i18n.getLocale()).toBe('en_US');
    expect(i18n.setLocale('de_DE')).toBe('en_US');
    expect(i18n.getLocale()).toBe('en_US');
    expect(i18n.setLocale('fr_FR')).toBe('fr_FR');
    expect(i18n.getLocale()).toBe('fr_FR');
  });
  test('t()', () => {
    i18n.setLocale('en_US');
    expect(i18n.t('test.hello')).toBe('World');
  });
});
