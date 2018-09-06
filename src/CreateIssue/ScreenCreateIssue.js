import React from 'react';
import PropTypes from 'prop-types';

import { IssueForm } from '../components';
import { gotoHome } from '../App';
import { linkJiraIssue, getTicket } from '../LinkIssues';
import { createThrottle, reduxConnector } from '../infrastructure';
import { loadJiraCreateMeta, createJiraIssue } from './actions'
import { issueTypesToOptions, projectsToOptions, formValuesToIssue } from "./issueMappers";

export class ScreenCreateIssue  extends React.Component
{
  static propTypes = {

    ticket: PropTypes.object.isRequired,

    comment: PropTypes.string,

    loadJiraCreateMeta: PropTypes.func,

    createJiraIssue: PropTypes.func,

    linkJiraIssue: PropTypes.func,

    navigator:  PropTypes.func.isRequired,

    dpapp:        PropTypes.object.isRequired
  };

  state = {
    projects:         [],
    issueTypes:       [],
    primaryFields:    [],
    secondaryFields:  [],
    formSubmitted:    false,
    project:          null,
    values: {}
  };

  componentDidMount()
  {
    const { loadJiraCreateMeta } = this.props;

    loadJiraCreateMeta().then(createMeta => {
        const projects = createMeta.getProjectList();
        const issueTypes = createMeta.getIssueTypeList(projects[0]);
        const values = { project: projects[0], issuetype: issueTypes[0], summary: this.props.comment || "" };

        return { projects, issueTypes, values };
      })
      .then(state => {
        const { project, issueType } = state.values;
        return this.loadFieldDefinitions(project, issueType).then(fields => ({ ...state, ...fields }));
      })
      .then(this.setState.bind(this))
      .catch(e => { console.error('error loading jira createMeta ', e); })
    ;
  }

  loadFieldDefinitions(project, issueType)
  {
    const { loadJiraCreateMeta } = this.props;

    return loadJiraCreateMeta().then(createMeta => {
      const issueTypes = issueType ? null : createMeta.getIssueTypeList(project);
      const nextIssueType = issueType || issueTypes[0];
      const fields = createMeta.getFieldLists(project, nextIssueType);

      const headerFields = ["project", "issuetype"];

      let primaryFields = fields.filter(field => field.required && -1 === headerFields.indexOf(field.key));
      primaryFields = fields.filter(field => "issuetype" === field.key).concat(primaryFields);
      primaryFields = fields.filter(field => "project" === field.key).concat(primaryFields);

      const secondaryFields = fields.filter(field => !field.required && -1 === headerFields.indexOf(field.key));
      return { primaryFields, secondaryFields };
    })
      ;
  }

  onProjectFieldChange(value)
  {
    const { projects } = this.state;
    const option = projectsToOptions(projects).filter(o => o.value === value).pop();

    return this.loadFieldDefinitions(value)
      .then(state => {
        const values = { project: option, issuetype: null };
        return { ...state, values, project: value };
      })
  }

  onIssuetypeFieldChange(value) {
    const { issueTypes, project } = this.state;

    if (! project) {
      return;
    }

    const option = issueTypesToOptions(issueTypes).filter(o => o.value === value).pop();
    return this.loadFieldDefinitions(project, value)
      .then(state => {
        const values = { ...this.state.values, issuetype: option };
        return { ...state, values };
      });
  }

  /**
   * @param {*} value
   * @param {Object} field
   */
  onFieldChange = (value, field) =>
  {
    let setStatePromise;

    if ('project' === field) {
      setStatePromise = this.onProjectFieldChange(value);
    } else if ('issuetype' === field) {
      setStatePromise = this.onIssuetypeFieldChange(value);
    }

    if (setStatePromise) {
      setStatePromise.then(state => {
        this.setState({...this.state, ...state })
      });
    }
  };

  onSubmit(values)
  {
    const { createJiraIssue, linkJiraIssue, dpapp, navigator, ticket } = this.props;
    const issueData = formValuesToIssue(values);

    function submitHandler () {
      createJiraIssue(issueData)
        .then(issue => linkJiraIssue(dpapp, issue, ticket))
        .then(() => navigator()(gotoHome));
    }

    // let's wait to see see the changes in the ui before sending the request
    const waitForRenderMillis = 500;
    this.setState({ formSubmitted: true });
    setTimeout(submitHandler, waitForRenderMillis);
  }

  onSubmitThrottle = createThrottle(ScreenCreateIssue.prototype.onSubmit.bind(this));


  render()
  {
    const { projects, issueTypes, primaryFields, secondaryFields, values, formSubmitted } = this.state;

    return [
      <IssueForm
        actionType={ "create" }

        onChange = { this.onFieldChange }
        onSubmit = { this.onSubmitThrottle }

        allowedValues = {
          { project: projectsToOptions(projects), issuetype: issueTypesToOptions(issueTypes) }
        }

        primaryFields =   { primaryFields }
        secondaryFields = { secondaryFields }
        values =          { values }
        loading =         { formSubmitted }
    />];
  }
}

export default reduxConnector(
  ScreenCreateIssue, { loadJiraCreateMeta, createJiraIssue, linkJiraIssue }, { ticket: getTicket }
);
