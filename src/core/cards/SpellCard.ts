import Card from '@core/cards/Card';

/**
 * Class SpellCard is a specific card use to summon a creature
 */
export default abstract class SpellCard extends Card {
  public override readonly type = 'spell';

  public onCast(): void {}
}
