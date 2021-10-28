import I18N from '../src/core/misc/I18N';
import CardManager from '../src/core/cards/CardManager';
import Card from '../src/core/cards/Card';

async function checkCardsLocalization(): Promise<[Card, string][]> {
  const i18n = new I18N('./locales/', 'fr_FR');
  const cardManager = new CardManager();
  await i18n.load();
  await cardManager.load();
  const errors: [Card, string][] = [];
  cardManager.getCards().forEach(card => {
    i18n.getCatalog().forEach(locale => {
      if (!(i18n.hasKey(`cards.${card.id}.name`, locale) && i18n.hasKey(`cards.${card.id}.text`, locale))) {
        errors.push([card, `Missing translation for card ${card.getIdStr()} in locale ${locale}`]);
      }
    });
  });
  return errors;
}

describe('Check cards localization', () => {
  it('should have all cards translations', async () => {
    expect(await checkCardsLocalization()).toEqual([]);
  });
});
