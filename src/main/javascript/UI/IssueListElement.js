import React from 'react';
import PropTypes from 'prop-types';

import { ListElement, Icon, Heading } from '@deskpro/react-components';

export class IssueListElement extends React.Component
{
  static propTypes = {

    issue: PropTypes.object.isRequired,

    actions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        dispatch: PropTypes.func.isRequired
      })
    ).isRequired
  };

  render()
  {
    const { issue, actions } = this.props;
    const { key, fields } = issue;

    return (
      <ListElement className="dp-issue-card">

        <Heading size={3}>
          <span>
            <img className={"dp-issue-card__issue-type"} src={ fields.issuetype.iconUrl } title={ fields.issuetype.name }/>
            { key }
          </span>
          <span>
            { actions.map(action => this.renderAction(issue, action)) }
          </span>
        </Heading>

        <p className="dp-issue-card__summary">
          { fields.summary }
        </p>

      </ListElement>
    );
  }

  renderAction(issue, action)
  {
    const { name, dispatch } = action;
    // do not display edit fields
    if (name === 'edit') {
      return null;
    }

    const actionModifier = action.name === 'link' ? 'issue-card__action--inactive' : '';

    let actionTitle = 'edit';
    let actionIcon = 'fa-pencil';
    if (name === 'link') {
      actionTitle = 'Link';
      actionIcon = 'fa-link';
    } else if (name === 'unlink') {
      actionTitle = 'Unlink';
      actionIcon = 'fa-link';
    }

    return (
      <a key={`${issue.id}__${name}`} className={`issue-card__action ${actionModifier}`} href="#" onClick={() => dispatch(issue) } title={actionTitle}>
        <i className={`fa fa-fw ${actionIcon}`} aria-hidden="true" />
      </a>
    );
  }

}
