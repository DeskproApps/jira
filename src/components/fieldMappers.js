import React from 'react';
import { Textarea, Select, Input } from '../Forms';
import { DisplayField } from './DisplayField';


function textareaMapper(field, allowedValues, onChange)
{
  const forced = ['summary', 'description'];

  let canMap = false;
  const { schema } = field;
  if (schema && typeof schema === 'object' && schema.type === 'string') {
    canMap = forced.length === 0 ? false : -1 !== forced.indexOf(field.key);
  }

  if (canMap) {
    return <Textarea label={ field.name } name={ field.key } onChange={onChange}/>;
  }
  return null;
}

function selectboxMapper(field, allowedValues, onChange)
{
  let canMap = false;

  const { schema } = field;
  if (schema && typeof schema === 'object' && field.allowedValues) {
    // exception: can not handle attachements
    canMap = !(schema.items && schema.items === 'attachement');
  }

  if (canMap) {
    return <Select
      label={field.name}
      name=     { field.key }
      //validate={false}
      options=  {allowedValues}

      isMulti=  {field.schema.type === 'array'}
      onChange= {onChange}
    />;
  }
}

function inputboxMapper(field, allowedValues, onChange)
{
  let canMap = false;

  const { schema } = field;
  canMap = schema && typeof schema === 'object' && -1 !== ['string', 'any'].indexOf(schema.type);

  if (canMap) {
    return <Input label={ field.name } name={ field.key } onChange={onChange} />;
  }
}

function displayFieldMapper(field, allowedValues, onChange)
{
  let canMap = false;
  const { displayOnly, name, key } = field;
  canMap = displayOnly === true;


  if (canMap) {
    return <DisplayField name={ key } label={name} />;
  }
}

export function map(field, allowedValues, onChange)
{
  const mappers = [textareaMapper, selectboxMapper, inputboxMapper, displayFieldMapper];
  return mappers.reduce(function (acc, mapper) {
    if (acc) {
      return acc;
    }
    return mapper(field, allowedValues, onChange);
  }, null);
}


export default map;
