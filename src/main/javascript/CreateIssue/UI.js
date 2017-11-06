import React from 'react';
import PropTypes from 'prop-types';

import { Form, Container, Group, Label, Input, HiddenFields  } from '@deskpro/react-components';

import { SelectProjects, SelectIssueTypes, SubmitButton } from '../UI';
import { IssueFieldMapper } from '../IssueFields';

export class UI  extends React.Component
{
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChangeSchema: PropTypes.func.isRequired,
    projects: PropTypes.array.isRequired,
    issueTypes: PropTypes.array.isRequired,
    primaryFields: PropTypes.array.isRequired,
    secondaryFields: PropTypes.array.isRequired
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    const { projects, issueTypes } = this.props;

    this.state = {
      project: projects.length ? projects[0].key : '',
      issueType: issueTypes.length ? issueTypes[0].id : ''
    }
  }

  componentWillReceiveProps(nextProps)
  {
    const { project, issueType } = this.state;
    const { projects, issueTypes } = nextProps;
    let nextState = null;

    if (project === '' && projects && projects.length ) {
      nextState = { project: projects[0].key };
    }

    if (issueType === '' && issueTypes && issueTypes.length ) {
      nextState = { ...(nextState || {}), issueType: issueTypes[0].id };
    }

    if (nextState) {
      this.setState(nextState)
    }
  }

  handleSubmit(e, values)
  {
    let model = JSON.parse(JSON.stringify(values));
    model = {
      ...model,
      project: {
        key: values.project
      },
      issuetype : {
        id: values.issuetype
      }
    };
    return this.props.onSubmit(model);
  }

  onProjectChanged(option, name)
  {
    const project = option ? option.value : null;

    this.setState({ project, issueType: null });
    this.props.onChangeSchema({ project, issueType: null });
  }

  onIssueTypeChanged(option, name)
  {
    const issueType = option ? option.value : null;

    const { project } = this.state;
    this.setState({ issueType });

    this.props.onChangeSchema({ project, issueType });
  }

  render()
  {
    const { projects, issueTypes, primaryFields, secondaryFields } = this.props;
    const { project, issueType } = this.state;

    return (

      <Form name="create_issue" onSubmit={this.handleSubmit.bind(this)}>

        <Group label="Project" >
          <SelectProjects
            id="project"
            name="project"
            value={project}
            options={ projects }
            onChange={this.onProjectChanged.bind(this)}
          />
        </Group>

        <Group label="Issue Type" >
          <SelectIssueTypes
            id="issuetype"
            name="issuetype"
            value={issueType}
            options={ issueTypes }
            onChange={this.onIssueTypeChanged.bind(this)}
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
    const formComponent = IssueFieldMapper.toFormComponent(field, null);
    if (!formComponent) {
      return null;
    }

    const { key: id, name: label } = field;
    return (
      <Group key={`field-group-${id}`} label={label} >
        { React.cloneElement(formComponent, { id }) }
      </Group>
    );
  }

}
