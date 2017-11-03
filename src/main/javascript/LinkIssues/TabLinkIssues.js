import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI'
import { Routes } from '../App'

export class TabLinkIssues  extends React.Component
{
  static get className() {  return TabLinkIssues.prototype.constructor.name }

  static propTypes = {
    navigate: PropTypes.func.isRequired,
    linkedIssues: PropTypes.array.isRequired
  };

  static contextTypes = {
    unlinkJiraIssue: PropTypes.func.isRequired
  };

  onUnlinkIssue(issue)
  {
    const {
      /** @type {function} */ unlinkJiraIssue,
    } = this.context;

    unlinkJiraIssue(issue).then(issue => {
      //update the local state of the linked issue
    });
  }

  render()
  {
    const { navigate, linkedIssues } = this.props;
    const { unlinkJiraIssue } = this.context;

    const issueActions = linkedIssues.reduce((acc, issue) => {
      acc[issue.key] = {
        dispatch: unlinkJiraIssue,
        type: 'unlink'
      };
      return acc;
    }, {});
    return (<UI
      issues={ linkedIssues }
      issueActions={issueActions}
      navigateToCreate={() => navigate(Routes.createIssue)}
    />);
  }
}
