import I18N from '@core/misc/I18N';
import Card from '@core/cards/Card';

export type LocalizedCard<T extends Card> = T & {name: string; text: string};

/**
 * Returns a localized version of the given card.
 * @remarks The returned card is a copy of the given card. If the given card is readonly then the returned card is also readonly.
 * @param card The card to localize.
 * @param i18n The i18n object to use.
 */
export default function localizeCard<T extends Card>(card: T, i18n: I18N): LocalizedCard<T> {
  const c = card.clone() as LocalizedCard<T>;
  Object.defineProperty(c, 'name', {get: () => i18n.t(`cards.${card.id}.name`), enumerable: true});
  Object.defineProperty(c, 'text', {get: () => i18n.t(`cards.${card.id}.text`), enumerable: true});
  return card.isReadonly() ? Object.freeze(c) : c;
}

/**
 * Verifies that a card is a valid localized card.
 * @param card The card to verify.
 */
localizeCard.isLocalizedCard = function <T extends Card>(card: LocalizedCard<T>): boolean {
  return card.name !== undefined && card.text !== undefined;
};
