import { Input } from '@deskpro/react-components';

export class GenericInputFieldMapper
{
  /**
   * @param {object} field
   * @return {*|boolean}
   */
  canMap(field)
  {
    const { schema } = field;
    return schema && typeof schema === 'object' && schema.type === 'string';
  }

  /**
   * @param {{}} field
   * @param {FieldMapperSpecificityCalculator} calculator
   * @return {FieldMapperSpecificityCalculator}
   */
  computeSpecificity(field, calculator)
  {
    if (! this.canMap(field)) {
      return calculator;
    }

    return calculator.matchedByType();
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
