import {CardId} from '@core/cards/Card';

export class EmptyDeckError extends Error {
  constructor() {
    super('Deck is empty');
  }
}

export class HandFullError extends Error {
  constructor() {
    super('Hand is full');
  }
}

export class UnsupportedVersionError extends Error {
  constructor(unsupportedVersion: string | number) {
    super(`Unsupported version: ${unsupportedVersion}`);
  }
}

export class NotACardError extends Error {
  constructor(card: string) {
    super(`${card} is not a card`);
  }
}

export class CardIdAlreadyExistsError extends Error {
  constructor(cardId: CardId) {
    super(`Card with id ${cardId} already exists`);
  }
}

export class InvalidCodeError extends Error {
  constructor() {
    super('Invalid code');
  }
}

export class InvalidDeckError extends Error {
  constructor(error: string) {
    super(`Invalid deck: ${error}`);
  }
}

export class UnknownCardError extends Error {
  constructor() {
    super('Unknown card');
  }
}

export class MinionNotAttachedToGameError extends Error {
  constructor() {
    super('Minion is not attached to a game');
  }
}
