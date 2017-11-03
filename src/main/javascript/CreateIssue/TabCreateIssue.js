import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI';
import { Routes} from '../App';

export class TabCreateIssue  extends React.Component
{
  static get className() {  return TabCreateIssue.prototype.constructor.name }

  static propTypes = {
    navigate: PropTypes.func.isRequired
  };

  static contextTypes = {

    createJiraIssue: PropTypes.func.isRequired,

    linkJiraIssue: PropTypes.func.isRequired,

    loadJiraCreateMeta: PropTypes.func.isRequired
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    this.state = {
      projects: [],
      issueTypes: [],
      primaryFields: [],
      secondaryFields: []
    }
  }

  componentDidMount()
  {
    const {
      /** @type {function():Promise} */ loadJiraCreateMeta
    } = this.context;

    loadJiraCreateMeta()
      .then(createMeta => {
        const projects = createMeta.getProjectList();
        const issueTypes = createMeta.getIssueTypeList(projects[0]);
        const fields = createMeta.getFieldLists(projects[0], issueTypes[0]);

        const primaryFields = fields.filter(({ required, key }) => required );
        const secondaryFields = fields.filter(({ required }) => !required );

        return { projects, issueTypes, fields, primaryFields, secondaryFields };
      })
      .then(this.setState.bind(this))
    ;
  }

  onSubmit(model)
  {
    const {
      /** @type {function} */ linkJiraIssue,
      /** @type {function({}):Promise} */ createJiraIssue,
    } = this.context;

    const { /** @type {function(String)} */ navigate } = this.props;

    createJiraIssue(model)
      .then(issue => {
        return linkJiraIssue(issue)
      })
      .then(() => navigate(Routes.linkedIssues));
  }

  onChangeSchema({ project, issueType })
  {
    const {
      /** @type {function():Promise} */ loadJiraCreateMeta
    } = this.context;

    loadJiraCreateMeta()
      .then(createMeta => {
        const issueTypes = issueType ? null : createMeta.getIssueTypeList(project);
        const nextIssueType = issueType || issueTypes[0];
        const fields = createMeta.getFieldLists(project, nextIssueType);

        const primaryFields = fields.filter(({ required }) => required );
        const secondaryFields = fields.filter(({ required }) => !required );

        if (issueTypes) {
          return { issueTypes, primaryFields, secondaryFields };
        }
        return { primaryFields, secondaryFields };
      })
      .then(this.setState.bind(this))
    ;
  }

  render()
  {
    const { projects, issueTypes, primaryFields, secondaryFields } = this.state;

    return (<UI
      onChangeSchema = { TabCreateIssue.prototype.onChangeSchema.bind(this) }
      onSubmit = { TabCreateIssue.prototype.onSubmit.bind(this) }
      projects = { projects }
      issueTypes = { issueTypes }
      primaryFields = { primaryFields }
      secondaryFields = { secondaryFields }
    />);
  }
}
