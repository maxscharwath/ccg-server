import MinionCard, {MinionGameContext} from '@core/cards/MinionCard';
import SpellCard, {SpellGameContext} from '@core/cards/SpellCard';
import {CardRarity} from '@core/cards/CardRarity';

export class KingKrushCard extends MinionCard {
  public id = 1;
  public attack = 8;
  public cost = 9;
  public health = 8;
  public tag = 'king_krush';
  public rarity = CardRarity.LEGENDARY;

  override onUse(context: MinionGameContext) {
    context.on('round', () => {
      context.minion.attack += 2;
      context.minion.health += 2;
    });
  }
}

export class TheCoinCard extends SpellCard {
  public id = 2;
  public cost = 9;
  public tag = 'the_coin';
  public rarity = CardRarity.COMMON;

  override onCast(context: SpellGameContext): boolean {
    if (super.onCast(context)) {
      context.hero.mana += 1;
      return true;
    }
    return false;
  }
}

export class PoisonCard extends SpellCard {
  public id = 3;
  public cost = 2;
  public tag = 'poison';
  public rarity = CardRarity.COMMON;
}

export class HealthBoostCard extends SpellCard {
  public id = 4;
  public cost = 2;
  public tag = 'health_boost';
  public rarity = CardRarity.COMMON;
}

export class GreatEaterCard extends MinionCard {
  public id = 5;
  public attack = 3;
  public cost = 8;
  public health = 5;
  public tag = 'great_eater';
  public rarity = CardRarity.RARE;

  override onUse(context: MinionGameContext) {
    context.on(
      'endTurn',
      () => {
        const minion = context.opponent.board?.getRandom();
        if (!minion) return;
        context.minion.health = minion.health;
        context.minion.attack = minion.attack;
        minion.die();
      },
      (turn, hero) => hero === context.hero
    );
  }
}
