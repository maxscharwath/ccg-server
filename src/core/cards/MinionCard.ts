import Card from '@core/cards/Card';

/**
 * Class MinionCard is a type of card represents Minion
 * @abstract
 */
export default abstract class MinionCard extends Card {
  public override readonly type = 'minion';
  public abstract attack: number;
  public abstract health: number;
}
