import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI'

const createThrottle  = (callback, delay) => {
  let isThrottled = false, args, context;

  function throttle() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }

    isThrottled = true;
    callback.apply(this, arguments);

    setTimeout(() => {
      isThrottled = false;
      if (args) {
        throttle.apply(context, args);
        args = context = null;
      }
    }, delay);
  }

  return throttle;
};

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
      issues: [],
      issueActions: {},
      ui: 'normal'
    }
  }

  onSearch(query)
  {
    if (typeof  query !== 'string') {
      return ;
    }

    if (typeof query === 'string' && query.length === 0) {
      this.setState({ issues: [], issueActions: {} });
      return;
    }

    if (typeof query === 'string' && query.length < 3) {
      return;
    }

    const {
      /** @type {function} */ searchJiraIssues,
      /** @type {function} */ createIssueAction,
    } = this.context;

    this.setState({ ui: 'loading' });

    searchJiraIssues(query).then(issues => {
      const actionInterceptor = this.onIssueAction.bind(this);
      const issueActions = issues.reduce((acc, issue) => {
        acc[issue.key] = createIssueAction(issue, { interceptor: actionInterceptor });
        return acc;
      }, {});

      this.setState({ ui: 'normal', issues, issueActions });
    });
  }

  onIssueAction(action, issue)
  {
    const {
      /** @type {function} */ createIssueAction
    } = this.context;


    // to do stop searching
    action.dispatch(issue)
      .then(issue => {
        const { issueActions } = this.state;
        const existingAction = issueActions[issue.key];
        if (existingAction) {
          const actionInterceptor = this.onIssueAction.bind(this);
          issueActions[issue.key] = createIssueAction(issue, { interceptor: actionInterceptor });
          this.setState({ issueActions });
        }
      })
    ;
  }

  render()
  {
    const { issues, issueActions, ui } = this.state;
    return (<UI
      state={ui}
      issues={issues}
      issueActions={issueActions}
      onSearch={createThrottle(this.onSearch.bind(this), 500)}
    />);
  }
}
