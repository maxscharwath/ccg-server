import I18N from '../src/core/misc/I18N';
import CardManager from '../src/core/cards/CardManager';
import localizeCard, {LocalizedCard} from '../src/core/cards/LocalizedCard';
import Card from '../src/core/cards/Card';

describe('Test LocalizedCard', () => {
  const i18n = new I18N('./locales/', 'fr_FR');
  const cardManager = new CardManager();
  beforeAll(async () => {
    await i18n.load();
    await cardManager.load();
  });
  test('should convert mutable card to localized mutable card', () => {
    const card = cardManager.getMutableCardById(1);
    const mutableLocalizedCard = localizeCard(card, i18n);
    expect(mutableLocalizedCard).toBeInstanceOf(card.constructor);
    expect(mutableLocalizedCard.name).not.toBeUndefined();
    expect(mutableLocalizedCard.text).not.toBeUndefined();
    expect(localizeCard.isLocalizedCard(mutableLocalizedCard)).toBe(true);
    expect(localizeCard.isLocalizedCard(card as LocalizedCard<Card>)).toBe(false);
    expect(Object.isFrozen(mutableLocalizedCard)).toBeFalsy();
    expect(Object.isFrozen(card)).toBeFalsy();
  });
  test('should convert readonly card to localized readonly card', () => {
    const card = cardManager.getCardById(1);
    const localizedCard = localizeCard(card, i18n);
    expect(localizedCard).toBeInstanceOf(card.constructor);
    expect(localizedCard.name).not.toBeUndefined();
    expect(localizedCard.text).not.toBeUndefined();
    expect(localizeCard.isLocalizedCard(localizedCard)).toBe(true);
    expect(localizeCard.isLocalizedCard(card as LocalizedCard<Card>)).toBe(false);
    expect(Object.isFrozen(localizedCard)).toBeTruthy();
    expect(Object.isFrozen(card)).toBeTruthy();
  });
  test('json should works', () => {
    const card = cardManager.getMutableCardById(1);
    const mutableLocalizedCard = localizeCard(card, i18n);
    const json = mutableLocalizedCard.toJSON();
    expect(json).toBeInstanceOf(Object);
    expect(json).toMatchObject(card.toJSON());
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('text');
  });
});
