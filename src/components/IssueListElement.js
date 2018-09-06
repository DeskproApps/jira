import React from 'react';
import PropTypes from 'prop-types';
import { Loader, List, ListItem, Panel, Button, Tabs, TabMenu, ActionBar, Action } from '@deskpro/apps-components';

export class IssueListElement extends React.Component
{
  static propTypes = {

    issue: PropTypes.object.isRequired,

    link: PropTypes.func,

    unlink: PropTypes.func,

    edit: PropTypes.func
  };

  link = () => {
    const { issue, link } = this.props;
    link(issue);
  };

  unlink = () => {
    const { issue, unlink } = this.props;
    unlink(issue);
  };

  edit = () => {
    const { issue, edit } = this.props;
    edit(issue);
  };

  render()
  {
    const { issue } = this.props;
    const { key, fields } = issue;

    return (
      <ListItem className="dp-issue-card">

        <ActionBar iconUrl={fields.issuetype.iconUrl} title={fields.issuetype.name} >

          {
            [
              this.props.link ? <Action icon={"link"} label={"Link"} labelDisplay={"onHover"} onClick={this.link}/> : null,
              this.props.unlink ? <Action icon={"unlink"} label={"Unlink"} labelDisplay={"onHover"} onClick={this.unlink}/> : null,
              this.props.edit ? <Action icon={"edit"} label={"Edit"} labelDisplay={"onHover"} onClick={this.edit}/> : null
            ].filter(x => !!x)
          }

        </ActionBar>

        <span>{ fields.summary }</span>

      </ListItem>
    );
  }

}
