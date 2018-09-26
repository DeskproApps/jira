import React from 'react';
import PropTypes from 'prop-types';
import { Loader, List, Panel, Button, Tabs, TabMenu, Icon, ActionBar } from '@deskpro/apps-components';

import { IssueForm } from '../components';
import { gotoHome } from '../App';

import { createThrottle, reduxConnector } from '../infrastructure';
import { loadJiraEditMeta, updateJiraIssue} from './actions'
import {formValuesToIssue, issueToFormValues, issueTypesToOptions} from "./issueMappers";

const emptyObject = {};

export class ScreenEditIssue  extends React.Component
{
  static propTypes = {

    issue: PropTypes.object,

    loadJiraEditMeta:   PropTypes.func.isRequired,

    updateJiraIssue:   PropTypes.func.isRequired,

    navigator:  PropTypes.func.isRequired,
  };

  state = {
    primaryFields: [],
    secondaryFields: [],
    values: emptyObject,
    changes: emptyObject,
    formSubmitted: false
  };

  componentDidMount()
  {
    const { loadJiraEditMeta } = this.props;

    loadJiraEditMeta(this.props.issue).then(meta => {

        const fields = Object.keys(meta.fields).map(key => meta.fields[key]);
        const values = issueToFormValues(this.props.issue, fields);
        values.project = this.props.issue.fields.project.name;

        const headerFields = ["project", "issuetype"];
        const otherPrimaryFields = fields.filter(field => field.required).filter(field => -1 === headerFields.indexOf(field.key));

        let primaryFields = fields.filter(field => -1 !== headerFields.indexOf(field.key)).concat(otherPrimaryFields);
        primaryFields = [{ name: "Project", key: "project", displayOnly: true }].concat(primaryFields);
        const secondaryFields = fields.filter(field => !field.required).filter(field => -1 === headerFields.indexOf(field.key));

        this.setState({ primaryFields, secondaryFields, values });
      })
      .catch(e => { console.log('error loading jira editMeta '); console.error(e); })
    ;
  }

  onFieldChange = (value, field) => {};

  onSubmit = (changes) =>
  {
    const { navigator, updateJiraIssue, issue } = this.props;
    const issueData = formValuesToIssue(changes);

    function submitHandler () {
      updateJiraIssue(issue, issueData).then(() => navigator()(gotoHome));
    }

    // let's wait to see see the changes in the ui before sending the request
    const waitForRenderMillis = 500;
    this.setState({ formSubmitted: true });
    setTimeout(submitHandler, waitForRenderMillis);
  };

  render()
  {
    const { primaryFields, secondaryFields, values, formSubmitted } = this.state;
    const issueTypeField = primaryFields.filter(field => field.key === "issuetype").pop();

    return [
      <IssueForm
        actionType={ "edit" }
        onChange = { this.onFieldChange }
        onSubmit = { createThrottle(this.onSubmit, 500) }

        allowedValues = {{
          issuetype: issueTypeField ? issueTypesToOptions(issueTypeField.allowedValues) : []
        }}

        primaryFields =   { primaryFields }
        secondaryFields = { secondaryFields }
        values =          { values }
        loading =         { formSubmitted }
    />];
  }
}

export default reduxConnector(ScreenEditIssue, { loadJiraEditMeta, updateJiraIssue }, {});
