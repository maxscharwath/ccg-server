import Card from '@core/cards/Card';
import Target from '@core/Target';

export type CastOptions = {
  target?: Target;
};
/**
 * Class SpellCard is a specific card use to summon a creature
 */
export default abstract class SpellCard extends Card {
  public override readonly type = 'spell';

  public canCast(target?: Target): boolean {
    return true;
  }

  public onCast(options: CastOptions): boolean {
    return this.canCast(options.target);
  }
}
