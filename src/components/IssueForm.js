import React from 'react';
import PropTypes from 'prop-types';

import { Form, HiddenFields } from '../Forms';
import mapField from './fieldMappers';

import { SubmitButton } from './SubmitButton';

import { Button } from '@deskpro/apps-components';

export class IssueForm  extends React.PureComponent
{
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func,

    values:         PropTypes.object.isRequired,
    allowedValues:  PropTypes.object.isRequired,

    primaryFields:    PropTypes.array.isRequired,
    secondaryFields:  PropTypes.array.isRequired,

    actionType: PropTypes.oneOf([
      "edit", "create"
    ]),
    loading:    PropTypes.bool

  };

  render()
  {
    const { primaryFields, secondaryFields, onSubmit, values } = this.props;

    return (

      <Form name="create_issue" onSubmit={onSubmit} initialValues={values}>

        { primaryFields.map(field => this.renderField(field)) }

        <HiddenFields opened={false} labelShow={"Show all fields"} labelHide={"Show only required fields"}>
          { secondaryFields.map(this.renderField) }
        </HiddenFields>

        <div className="dp-form-group dp-form-controls">
          { this.renderFormControls() }
        </div>

      </Form>

    );
  }

  renderFormControls()
  {
    const { loading, onCancel } = this.props;
    return [
      <SubmitButton className={"dp-form-control"} loading={ loading } disabled={ loading }> {  this.props.actionType === "create" ? 'Create' : 'Edit'  } </SubmitButton>,
      onCancel ? <Button className={"dp-form-control"} disabled={ loading } onClick={onCancel}> Cancel </Button> : null
    ].filter(x => !!x);
  }

  renderField = (field) =>
  {
    const { key } = field;

    const { allowedValues, onChange } = this.props;

    const rendered = mapField(field, allowedValues[key], onChange);
    if (rendered) {
      return rendered;
    }

    return <noscript/>;
  };

}
