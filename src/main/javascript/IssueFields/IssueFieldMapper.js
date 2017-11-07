import { GenericSelectFieldMapper } from './GenericSelectFieldMapper';
import { GenericInputFieldMapper } from './GenericInputFieldMapper';
import { GenericTextareaFieldMapper } from './GenericTextareaFieldMapper';
import { FieldMapperSpecificityCalculator } from './FieldMapperSpecificityCalculator';

const registeredMappers = [
  new GenericSelectFieldMapper(),
  new GenericInputFieldMapper(),
  new GenericTextareaFieldMapper({ fieldNames: ['summary', 'description'] })
];

const compareSpecificity = (mapperA, mapperB, field) =>
{
  const specificA = mapperA.computeSpecificity(field, new FieldMapperSpecificityCalculator()).score();
  const specificB = mapperB.computeSpecificity(field, new FieldMapperSpecificityCalculator()).score();

  return Math.sign(specificA - specificB);
};

export class IssueFieldMapper
{
  static toFormComponent(field, value)
  {
    const mappers = registeredMappers.filter(mapper => mapper.canMap(field));

    if (mappers.length === 0) {
      return null;
    }

    if (mappers.length === 1) {
      const [ mapper ] = mappers;
      return mapper.map(field, value);
    }

    // multiple mappers, sort according to specificity
    mappers.sort((mapperA, mapperB) => -1 * compareSpecificity(mapperA, mapperB, field));
    const [ mapper ] = mappers;
    return mapper.map(field, value);
  }
}
