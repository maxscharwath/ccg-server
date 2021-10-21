import Card from './Card';

export default abstract class MinionCard extends Card {
  public override readonly type = 'minion';
  abstract attack: number;
  abstract health: number;
}
