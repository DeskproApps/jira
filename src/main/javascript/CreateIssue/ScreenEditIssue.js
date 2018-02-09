import React from 'react';
import PropTypes from 'prop-types';

import { IssueForm } from '../UI';
import { Routes } from '../App';

import { createUpdateJiraIssueAction } from '../CreateIssue';
import { createThrottle } from '../Infrastructure';
import { createLoadEditMetaAction } from './Services'


const emptyObject = {};

export class ScreenEditIssue  extends React.Component
{
  static get className() {  return TabCreateIssue.prototype.constructor.name }

  static propTypes = {

    issue: PropTypes.object,

    route:   PropTypes.object,

    dispatch:   PropTypes.func.isRequired
  };

  static contextTypes = {

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
      values: emptyObject,
      changes: emptyObject,
      formSubmitted: false
    }
  }

  componentDidMount()
  {
    const { dispatch } = this.props;
    dispatch(createLoadEditMetaAction(this.props.issue)).then(meta => {
        const fields = Object.keys(meta.fields).map(key => meta.fields[key]);
        const values = JSON.parse(JSON.stringify(this.props.issue.fields));

        const primaryFields = fields.filter(({ required }) => required );
        const secondaryFields = fields.filter(({ required }) => !required );

        this.setState({ primaryFields, secondaryFields, values });
      })
      .catch(e => { console.log('error loading jira editMeta ', e); })
    ;

  }

  onFieldChange = (value, field) =>
  {
    const values = { ...this.state.values, [field.key]: value };
    const changes = { ...this.state.changes, [field.key]: value };
    this.setState({ values, changes });
  };

  onSubmit = () =>
  {
    const { changes } = this.state;
    const { /** @type {{to:function}} */ route, dispatch } = this.props;

    if (changes === emptyObject) {
      return route.to(Routes.linkedIssues);
    }

    // let's wait see the changes in the ui before sending the request
    const waitForRenderMillis = 500;
    this.setState({formSubmitted: true});
    const model = JSON.parse(JSON.stringify(changes));
    setTimeout(
      dispatch(createUpdateJiraIssueAction(this.props.issue, model)).then(() => route.to(Routes.linkedIssues)),
      waitForRenderMillis
    );

  };

  render()
  {
    const { primaryFields, secondaryFields, values, formSubmitted } = this.state;
    const issueTypeField = primaryFields.filter(field => field.key === "issuetype").pop();

    return (<IssueForm
      actionType={ IssueForm.ACTIONTYPE_EDIT }
      onChange = { this.onFieldChange }
      onSubmit = { createThrottle(this.onSubmit, 500) }

      renderProject={IssueForm.createRenderDisplay()}
      renderIssueType={IssueForm.createRenderSelect(issueTypeField ? issueTypeField.allowedValues : [])}

      primaryFields = { primaryFields.filter(field => field.key !== "issuetype") }
      secondaryFields = { secondaryFields }
      values = {values}
      loading = { formSubmitted }
    />);
  }
}
