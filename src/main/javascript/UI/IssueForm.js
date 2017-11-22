import React from 'react';
import PropTypes from 'prop-types';

import { Form, Container, Group, Label, Input, HiddenFields  } from '@deskpro/react-components';

import { SelectProjects, SelectIssueTypes, SubmitButton } from '../UI';
import { IssueFieldMapper } from '../IssueFields';

export class IssueForm  extends React.Component
{
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,

    projects: PropTypes.array.isRequired,
    issueTypes: PropTypes.array.isRequired,

    values: PropTypes.object.isRequired,

    primaryFields: PropTypes.array.isRequired,
    secondaryFields: PropTypes.array.isRequired
  };

  render()
  {
    const { projects, issueTypes, primaryFields, secondaryFields, onSubmit, onChange, values } = this.props;

    return (

      <Form name="create_issue" onSubmit={onSubmit}>

        <Group label="Project" >
          <SelectProjects
            id="project"
            name="project"
            value={ values.project}
            options={ projects }
            onChange={onChange}
          />
        </Group>

        <Group label="Issue Type" >
          <SelectIssueTypes
            id="issuetype"
            name="issuetype"
            value={ values.issuetype }
            options={ issueTypes }
            onChange={ onChange }
          />
        </Group>

        {
          primaryFields.filter(({ key }) => -1 === ['project', 'issuetype'].indexOf(key))
            .map(field => this.renderField(field))
        }

        <HiddenFields opened={false} labelShow={"Show all fields"} labelHide={"Show only required fields"}>
          {
            secondaryFields.filter(({ key }) => -1 === ['project', 'issuetype'].indexOf(key))
              .map(field => this.renderField(field))
          }
        </HiddenFields>
        <br/>
        { this.renderCreateButton() }

      </Form>

    );
  }

  renderCreateButton()
  {
    return (
      <SubmitButton> Create </SubmitButton>
    );
  }

  renderField(field)
  {
    const { key: id, name: label } = field;
    const { values, onChange } = this.props;

    const formComponent = IssueFieldMapper.toFormComponent(field, values[field.key]);
    if (!formComponent) {
      return null;
    }

    return (
      <Group key={`field-group-${id}`} label={label} >
        { React.cloneElement(formComponent, { id, onChange }) }
      </Group>
    );
  }

}
