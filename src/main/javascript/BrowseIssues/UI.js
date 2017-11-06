import React from 'react';
import PropTypes from 'prop-types';

import { Section, Input, Loader } from '@deskpro/react-components';
import { IssueList } from '../UI';

export class UI  extends React.PureComponent
{
  static propTypes = {

    state: PropTypes.string.isRequired,

    issues: PropTypes.array.isRequired,

    issueActions: PropTypes.array.isRequired,

    onSearch: PropTypes.func.isRequired
  };

  render()
  {
    const { onSearch, issues, issueActions } = this.props;

    return (
      <div>
        <Input icon="search" onChange={onSearch} onKeyDown={onSearch} />

        { this.props.state === 'normal' &&
        <Section>
          <IssueList issues={issues} actions={issueActions}/>
        </Section>
        }

        { this.props.state === 'loading' &&
          <Loader size="small" />
        }

      </div>
    );
  }
}
