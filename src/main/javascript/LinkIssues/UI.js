import React from 'react';
import PropTypes from 'prop-types';

import { Section, Input, SelectableList, List, ListElement, Scrollbar } from '@deskpro/react-components';
import { IssueList } from '../UI'

export class UI  extends React.Component
{
  static propTypes = {

    issues: PropTypes.array.isRequired,

    issueActions: PropTypes.object.isRequired,

    navigateToCreate: PropTypes.func.isRequired,
  };


  renderEmptyList()
  {
    const { navigateToCreate } = this.props;

    return (<div>
      <p>You haven't linked any issues to this ticket. </p>
      <p>Click <a href="#here" onClick={navigateToCreate}>here</a> to create an issue.</p>
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
