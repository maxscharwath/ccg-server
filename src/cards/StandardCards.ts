import MinionCard from '../core/MinionCard';
import SpellCard from '../core/SpellCard';
import {CardRarity} from '../core/Card';

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
}
