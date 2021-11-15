import Card from '@core/cards/Card';
import {GameContext} from '@core/Game';
import Minion from '@core/Minion';

export type MinionGameContext = GameContext & {
  minion: Minion;
};
/**
 * Class MinionCard is a type of card represents Minion
 * @abstract
 */
export default abstract class MinionCard extends Card {
  public override readonly type = 'minion';
  public abstract attack: number;
  public abstract health: number;

  public onUse(context: MinionGameContext): void {}
}
