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

    const actionModifier = action.type === 'link' ? 'issue-card__action--inactive' : '';
    const actionTitle = action.type === 'link' ? 'Link' : 'Unlink';

    return (
      <ListElement>
        <div className={"issue-card"}>
          <div className={"issue-card__header"}>
            <h1 className={"issue-card__title"}> { key } </h1>
            <img className={"issue-card__type"} src={ fields.issuetype.iconUrl } title={ fields.issuetype.name }/>

            <a className={`issue-card__action ${actionModifier}`} href="#" onClick={() => action.dispatch(issue) } title={actionTitle}>
              <i className={`fa fa-link fa-fw`} aria-hidden="true" ></i>
            </a>
          </div>

          <p className="issue-card__body">
            { fields.summary }
          </p>

        </div>

      </ListElement>
    );
  }
}
