import React from 'react';
import PropTypes from 'prop-types';

import { UI } from './UI'
import { Routes } from '../App'
import { createUnlinkJiraIssueAction } from './Services'

export class TabLinkIssues  extends React.PureComponent
{
  static get className() {  return TabLinkIssues.prototype.constructor.name }

  static propTypes = {

    dispatch:   PropTypes.func.isRequired,

    linkedIssues: PropTypes.array.isRequired
  };

  static contextTypes = {
    ticket: PropTypes.func.isRequired
  };

  render()
  {
    const { linkedIssues, dispatch } = this.props;
    const { ticket } = this.context;

    const issueActions = linkedIssues.reduce((acc, issue) => {
      acc[issue.key] = {
        dispatch: () => dispatch(createUnlinkJiraIssueAction(issue, ticket())),
        name: 'unlink'
      };
      return acc;
    }, {});
    return (<UI
      issues={ linkedIssues }
      issueActions={issueActions}
    />);
  }
}
