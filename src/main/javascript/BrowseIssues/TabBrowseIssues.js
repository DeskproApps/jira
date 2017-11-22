import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI'
import { createThrottle } from '../Infrastructure'
import { createSearchIssuesAction } from './Services'
import { createLinkJiraIssueAction, createUnlinkJiraIssueAction} from '../LinkIssues';
import { Routes } from '../App';

export class TabBrowseIssues  extends React.Component
{
  static get className() {  return TabBrowseIssues.prototype.constructor.name }

  static propTypes = {

    route:   PropTypes.object.isRequired,

    dispatch:   PropTypes.func.isRequired,

    foundIssues: PropTypes.array.isRequired,

    linkedIssues: PropTypes.array.isRequired
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

    const { dispatch } = this.props;
    dispatch(createSearchIssuesAction(query));
  }

  render()
  {
    const {
      /** @type {function} */ ticket,
    } = this.context;

    const { ui } = this.state;
    const { foundIssues, linkedIssues, dispatch, route } = this.props;
    const issueActions = foundIssues.reduce((acc, issue) => {
      const actions = [];
      if (linkedIssues.filter(x => x.key === issue.key).length) {
        actions.push({
          name: 'unlink',
          dispatch: () => dispatch(createUnlinkJiraIssueAction(issue, ticket()))
        });
      } else {
        actions.push({
          name: 'link',
          dispatch: () => dispatch(createLinkJiraIssueAction(issue, ticket()))
        });
      }

      actions.push({
        name: 'edit',
        dispatch: issue => route.to(Routes.editIssue, { issue })
      });

      acc[issue.key] = actions;
      return acc;
    }, {});

    return (<UI
      state={ui}
      issues={foundIssues}
      issueActions={issueActions}
      onSearch={createThrottle(this.onSearch.bind(this), 500)}
    />);
  }
}
