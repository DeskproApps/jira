import React from 'react';
import PropTypes from 'prop-types';

import { Section, Input, SelectableList, List, ListElement, Scrollbar } from '@deskpro/react-components';
import { IssueList } from '../UI';

export class UI  extends React.Component
{
  static propTypes = {

    issues: PropTypes.array.isRequired,

    issueActions: PropTypes.object.isRequired,

    onSearch: PropTypes.func.isRequired
  };

  render()
  {
    const { onSearch, issues, issueActions } = this.props;

    return (
      <div style={{
      padding: '5px'
    }}>
      <Input icon="search" onChange={onSearch} onKeyDown={onSearch} />

      <Section>
        <IssueList issues={issues} actions={issueActions}/>
      </Section>

    </div>);
  }
}
