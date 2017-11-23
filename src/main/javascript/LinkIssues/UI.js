import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@deskpro/apps-sdk-react'
import { Routes } from '../App/Routes'
import { IssueList, IssueListElement } from '../UI'
import { Container, Heading, List, Scrollbar } from '@deskpro/react-components';

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

    return (
      <List>
        {
          issues.map(issue => {
            return (<IssueListElement key={issue.key} issue={issue} actions={issueActions[issue.key] || []} />)
          })
        }
      </List>
    );
  }

  render()
  {
    const { issues } = this.props;
    return issues.length ? this.renderList() : this.renderEmptyList();
  }
}
