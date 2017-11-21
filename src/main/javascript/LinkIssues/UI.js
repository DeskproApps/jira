import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@deskpro/apps-sdk-react'
import { Routes } from '../App/Routes'
import { IssueList } from '../UI'

export class UI  extends React.PureComponent
{
  static propTypes = {

    issues: PropTypes.array.isRequired,

    issueActions: PropTypes.object.isRequired
  };


  renderEmptyList()
  {

    return (<div>
      <p>You haven't linked any issues to this ticket. </p>
      <p>Click <Link to={Routes.createIssue}>here</Link></p>
    </div>);
  }

  renderList()
  {
    const { issues, issueActions } = this.props;
    return (<IssueList issues={issues} actions={issueActions}/>);
  }

  render()
  {
    const { issues } = this.props;
    return issues.length ? this.renderList() : this.renderEmptyList();
  }
}
