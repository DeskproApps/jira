import { Textarea } from '@deskpro/react-components';

export class GenericTextareaFieldMapper
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

    if (schema && typeof schema === 'object' && schema.type === 'string') {
      return this.props.fieldNames.length === 0 ? true : -1 !== this.props.fieldNames.indexOf(field.key);
    }

    return false;
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
    if (-1 !== this.props.fieldNames.indexOf(field.key)) {
      return calculator.matchedByName();
    }
  }

  /**
   * @param {object} field
   * @param value
   * @return {XML}
   */
  map(field, value)
  {
    return (
      <Textarea
        name={ field.key }
        value={ value }
      />);
  }
}
