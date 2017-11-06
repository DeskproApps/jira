import React from 'react';
import PropTypes from 'prop-types';

import { Section, Input, SelectableList, List, ListElement, Scrollbar } from '@deskpro/react-components';
import { IssueListElement } from './IssueListElement';

export class IssueList extends React.Component
{
  static propTypes = {

    issues: PropTypes.array.isRequired,

    actions: PropTypes.object.isRequired
  };

  render()
  {
    const { issues, actions } = this.props;

    return (
      <Scrollbar autoHeightMin={500}>
        <List>
          {
            issues.map(issue => {
              const action = actions[issue.key];
              return (<IssueListElement key={issue.key} issue={issue} action={action} />)
            })
          }
        </List>
      </Scrollbar>
    );
  }
}
