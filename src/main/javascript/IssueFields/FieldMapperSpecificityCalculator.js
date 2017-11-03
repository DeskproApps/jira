export class FieldMapperSpecificityCalculator
{
  constructor()
  {
    this.props = { score: 0 };
  }

  matchedByType()
  {
    this.props.score = this.props.score + 1;
    return this;
  }

  matchedByName()
  {
    this.props.score = this.props.score + 2;
    return this;
  }

  score()
  {
    return this.props.score;
  }
}
