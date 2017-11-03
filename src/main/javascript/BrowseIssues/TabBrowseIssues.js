import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI'

export class TabBrowseIssues  extends React.Component
{
  static get className() {  return TabBrowseIssues.prototype.constructor.name }

  static propTypes = {

    navigate: PropTypes.func.isRequired,

    linkedIssues: PropTypes.array.isRequired
  };

  static contextTypes = {

    searchJiraIssues: PropTypes.func.isRequired,

    linkJiraIssue: PropTypes.func.isRequired,

    unlinkJiraIssue: PropTypes.func.isRequired,

    createIssueAction: PropTypes.func.isRequired
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    this.state = {
      issues: []
    }
  }

  onSearch(query)
  {
    const {
      /** @type {function} */ searchJiraIssues,
    } = this.context;

    searchJiraIssues(query).then(issues => {

      // check which issue is already linked or not

      this.setState({ issues });
    });
  }

  onIssueAction(action, issue)
  {
    console.log('on issue action ', action, issue);

    action.dispatch(issue);
  }

  render()
  {
    const {
      /** @type {function} */ createIssueAction,
    } = this.context;

    const actionInterceptor = this.onIssueAction.bind(this);

    const { issues } = this.state;
    const issueActions = issues.reduce((acc, issue) => {
      acc[issue.key] = createIssueAction(issue, { interceptor: actionInterceptor });
      return acc;
    }, {});

    return (<UI
      issues={issues}
      issueActions={issueActions}
      onSearch={this.onSearch.bind(this)}
    />);
  }
}
