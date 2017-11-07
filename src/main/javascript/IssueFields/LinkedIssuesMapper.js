export class LinkedIssuesMapper
{
  /**
   * @param {Array<String>} fieldNames
   */
  constructor({ fieldNames })
  {
    this.props = { fieldNames };
  }

  /**
   * @param {object} field
   * @return {*|boolean}
   */
  canMap(field)
  {
    const { schema } = field;
    return schema && typeof schema === 'object' && schema.type === 'array' && schema.items === 'issuelinks';
  }

  /**
   * @param {{ key:string }} field
   * @param {FieldMapperSpecificityCalculator} calculator
   * @return {FieldMapperSpecificityCalculator}
   */
  computeSpecificity(field, calculator)
  {
    if (! this.canMap(field)) {
      return calculator;
    }

    calculator.matchedByType();
  }

  /**
   * @param {object} field
   * @param value
   * @return {XML}
   */
  map(field, value)
  {
    return (
      <Input
        name={ field.key }
        value={ value }
      />);
  }
}

