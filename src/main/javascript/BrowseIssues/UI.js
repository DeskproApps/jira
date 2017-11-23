import React from 'react';
import PropTypes from 'prop-types';

import { Input, Loader, Scrollbar } from '@deskpro/react-components';
import { IssueListElement } from '../UI';
import { List } from '@deskpro/react-components';


export class UI  extends React.PureComponent
{
  static propTypes = {

    state: PropTypes.string.isRequired,

    issues: PropTypes.array.isRequired,

    issueActions: PropTypes.object.isRequired,

    onSearch: PropTypes.func.isRequired
  };

  render()
  {
    const { onSearch, issues, issueActions } = this.props;

    return (
      <div>
        <Input icon="search" onChange={onSearch} onKeyDown={onSearch} />

        { this.props.state === 'normal' && this.renderList() }

        { this.props.state === 'loading' &&
          <Loader size="small" />
        }

      </div>
    );
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

}
