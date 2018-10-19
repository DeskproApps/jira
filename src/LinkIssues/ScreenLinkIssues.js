import React from 'react';
import PropTypes from 'prop-types';
import { List } from '@deskpro/apps-components';

import { gotoEdit, gotoHome } from '../App'
import { reduxConnector } from "../infrastructure";
import { unlinkJiraIssue, getLinkedIssues, getIssueUrl, getTicket } from "./dux";
import { IssueListElement } from '../components'

function renderEmptyList()
{
  return <p>You haven't linked any issues to this ticket. </p>;
}

export class ScreenLinkIssues extends React.PureComponent
{
  static propTypes = {

    ticket:   PropTypes.object.isRequired,

    dpapp:   PropTypes.object.isRequired,

    navigator:  PropTypes.func.isRequired,

    unlinkJiraIssue: PropTypes.func,

    getIssueUrl: PropTypes.func,

    linkedIssues: PropTypes.array.isRequired
  };

  componentDidMount() {
    this.props.dpapp.ui.badgeCount = this.props.linkedIssues.length;
  }

  unlink = (issue) =>
  {
    const { unlinkJiraIssue, dpapp, ticket } = this.props;
    unlinkJiraIssue(dpapp, issue, ticket)
  };

  getUrl = (issue) =>
  {
    const { getIssueUrl } = this.props;
    return getIssueUrl(issue)
  };


  edit = (issue) =>
  {
    const { navigator } = this.props;
    navigator({ issue, onCancelRoute: gotoHome })(gotoEdit)
  };

  renderList()
  {
    const { linkedIssues } = this.props;
    const mapper = issue => (
      <IssueListElement
        key={issue.key}
        issue={issue}
        edit={this.edit}
        unlink={this.unlink}
        url={this.getUrl(issue)}
      />
    );
    return <List> { linkedIssues.map(mapper) } </List>;
  }

  render()
  {
    const { linkedIssues } = this.props;
    return linkedIssues.length ? this.renderList() : renderEmptyList();
  }
}

export default reduxConnector(
  ScreenLinkIssues, { unlinkJiraIssue, getIssueUrl }, { linkedIssues: getLinkedIssues, ticket: getTicket }
);

