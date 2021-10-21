import Card from './Card';

export default abstract class SpellCard extends Card {
  public override readonly type = 'spell';
}
