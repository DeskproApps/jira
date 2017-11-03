import React from 'react';
import PropTypes from 'prop-types';

import { ListElement } from '@deskpro/react-components';

export class IssueListElement extends React.Component
{
  static propTypes = {

    issue: PropTypes.object.isRequired,

    action: PropTypes.object.isRequired
  };

  render()
  {
    const { issue, action } = this.props;
    const { key, fields } = issue;

    const actionLabel = action.type === 'link' ? 'Link' : 'Unlink';

    return (
      <ListElement>
        <div>
          <img src={ fields.issuetype.iconUrl } title={ fields.issuetype.name }/>
          <h6> { key } </h6>
          <a href="#" onClick={() => action.dispatch(issue) }>{actionLabel}</a>
        </div>
        <p>{ fields.summary }</p>
      </ListElement>
    );
  }
}
