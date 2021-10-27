import MinionCard from '@core/cards/MinionCard';
import SpellCard from '@core/cards/SpellCard';
import {CardRarity} from '@core/cards/Card';

export class KingKrushCard extends MinionCard {
  id = 1;
  attack = 8;
  cost = 9;
  health = 8;
  name = 'King Krush';
  text = 'Charge';
  rarity = CardRarity.LEGENDARY;
}

export class TheCoinCard extends SpellCard {
  id = 2;
  cost = 9;
  name = 'The Coin Card';
  text = 'Give a coin';
  rarity = CardRarity.COMMON;

  override onCast() {
    super.onCast();
    //todo give one mana.
  }
}

export class PoisonCard extends SpellCard {
  id = 3;
  cost = 2;
  name = 'Poison';
  text = 'Add 1 damage to each minion each turn for 3 rounds';
  rarity = CardRarity.COMMON;

  override onCast() {
    super.onCast();
    //todo give poison effect to all enemy board.
  }
}
