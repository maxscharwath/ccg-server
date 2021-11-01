import MinionCard from '@core/cards/MinionCard';
import SpellCard from '@core/cards/SpellCard';
import {CardRarity} from '@core/cards/Card';
export class KingKrushCard extends MinionCard {
  id = 1;
  attack = 8;
  cost = 9;
  health = 8;
  tag = 'king_krush';
  rarity = CardRarity.LEGENDARY;
}

export class TheCoinCard extends SpellCard {
  id = 2;
  cost = 9;
  tag = 'the_coin';
  rarity = CardRarity.COMMON;

  override onCast() {
    super.onCast();
    //todo give one mana.
  }
}
export class PoisonCard extends SpellCard {
  id = 3;
  cost = 2;
  tag = 'poison';
  rarity = CardRarity.COMMON;

  override onCast() {
    super.onCast();
    //todo give poison effect to all enemy board.
  }
}
