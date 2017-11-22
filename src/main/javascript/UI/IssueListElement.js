import React from 'react';
import PropTypes from 'prop-types';

import { ListElement } from '@deskpro/react-components';

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
      <ListElement>
        <div className={"issue-card"}>
          <div className={"issue-card__header"}>
            <h1 className={"issue-card__title"}> { key } </h1>
            <img className={"issue-card__type"} src={ fields.issuetype.iconUrl } title={ fields.issuetype.name }/>

            { actions.map(action => this.renderAction(issue, action)) }

          </div>

          <p className="issue-card__body">
            { fields.summary }
          </p>

        </div>

      </ListElement>
    );
  }

  renderAction(issue, action)
  {
    const { name, dispatch } = action;

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
