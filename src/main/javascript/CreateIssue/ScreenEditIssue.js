import React from 'react';
import PropTypes from 'prop-types';

import { IssueForm } from '../UI';
import { Routes } from '../App';

import { createLinkJiraIssueAction } from '../LinkIssues';
import { fieldValues } from '../IssueFields';


export class ScreenEditIssue  extends React.Component
{
  static get className() {  return TabCreateIssue.prototype.constructor.name }

  static propTypes = {

    issue: PropTypes.object,

    route:   PropTypes.object,

    dispatch:   PropTypes.func.isRequired
  };

  static contextTypes = {

    createJiraIssue: PropTypes.func.isRequired,

    loadJiraEditMeta: PropTypes.func.isRequired,

    ticket: PropTypes.func.isRequired
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    this.state = {
      primaryFields: [],
      secondaryFields: [],
      values: {}
    }
  }

  componentDidMount()
  {
    const {
      /** @type {function():Promise} */ loadJiraEditMeta
    } = this.context;

    loadJiraEditMeta(this.props.issue)
      .then(meta => {

        const fields = Object.keys(meta.fields).map(key => meta.fields[key]);
        const values = fieldValues(this.props.issue, fields);

        const primaryFields = fields.filter(({ required }) => required );
        const secondaryFields = fields.filter(({ required }) => !required );

        this.setState({ primaryFields, secondaryFields, values });
      })
      .catch(e => { console.log('error loading jira editMeta ', e); })
    ;

  }

  onFieldChange = (value, fieldId) =>
  {
    const values = { ...this.state.values, [fieldId]: value };
    this.setState({ values });
  };

  onSubmit = () =>
  {
    const { values } = this.state;
    let model = JSON.parse(JSON.stringify(values));
    model = { ...model, project: { id: values.project }, issuetype : { id: values.issuetype } };

    const {
      /** @type {function} */ ticket,
      /** @type {function({}):Promise} */ createJiraIssue,
    } = this.context;

    const { /** @type {{to:function}} */ route, dispatch } = this.props;

    createJiraIssue(model)
      .then(issue => dispatch(createLinkJiraIssueAction(issue, ticket())))
      .then(() => route.to(Routes.linkedIssues));
  };

  render()
  {
    const { primaryFields, secondaryFields, values } = this.state;

    return (<IssueForm
      onChange = { this.onFieldChange }
      onSubmit = { this.onSubmit }

      projects = { [] }
      issueTypes = { [] }
      primaryFields = { primaryFields }
      secondaryFields = { secondaryFields }
      values = {values}
    />);
  }
}
