function selectOption({ id, name }) {
  return { label: name, value: id };
}

export function issueTypesToOptions(values)
{
  return values.map(selectOption)
}

export function projectsToOptions(values)
{
  return values.map(selectOption);
}

export function formValuesToIssue(values)
{
  function reducer (acc, key) {

    let value = values[key] && typeof values[key] === 'object' && values[key].value ? { id : values[key].value } : values[key];
    if (values[key]) {
      acc[key] = value;
    }


    return acc;
  }

  return Object.keys(values).reduce(reducer, {});
}

function valueResolver(field) {

  if (field.schema.type === 'string') {
    return issue => issue.fields[field.key];
  }

  return issue => {
    const value = issue.fields[field.key];
    return value && typeof value === 'object' && value.id ? value.id : null;
  }
}

/**
 * @param issue
 * @param fields
 * @return {*}
 */
export function issueToFormValues(issue, fields)
{
  function reducer(acc, field) {

    const value = valueResolver(field);
    if (field.allowedValues) {
      acc[field.key] = selectOption(issue.fields[field.key])
    } else {
      acc[field.key] = value(issue);
    }

    return acc;
  }

  return fields.reduce(reducer, {});
}
