import React from 'react';
import PropTypes from 'prop-types';
import { Loader, List, Panel, Button, Tabs, TabMenu, Icon, ActionBar } from '@deskpro/apps-components';

import { Input, Form } from '../Forms';
import { createThrottle, reduxConnector } from '../infrastructure'
import { getFoundIssues, searchIssues } from './dux'
import { linkJiraIssue, unlinkJiraIssue, getLinkedIssues, getTicket } from '../LinkIssues';
import { gotoEdit, gotoBrowse, } from '../App';

import { IssueListElement } from '../components';

export class ScreenBrowseIssues  extends React.Component
{
  static propTypes = {

    ticket: PropTypes.object.isRequired,

    navigator:  PropTypes.func.isRequired,

    dpapp:   PropTypes.object.isRequired,

    unlinkJiraIssue:  PropTypes.func.isRequired,

    linkJiraIssue:    PropTypes.func.isRequired,

    searchIssues:     PropTypes.func.isRequired,

    foundIssues:                  PropTypes.array.isRequired,

    linkedIssues:                 PropTypes.array.isRequired
  };

  state = {
    ui: 'normal'
  };

  onSearch (query)
  {
    const { searchIssues } = this.props;
    searchIssues(query);
  };

  onSearchThrottled = createThrottle(this.onSearch.bind(this));

  unlink = (issue) =>
  {
    const { unlinkJiraIssue, dpapp, ticket } = this.props;
    unlinkJiraIssue(dpapp, issue, ticket)
  };

  link = (issue) =>
  {
    const { linkJiraIssue, dpapp, ticket } = this.props;
    linkJiraIssue(dpapp, issue, ticket);
  };

  edit = (issue) =>
  {
    const { navigator } = this.props;
    navigator({ issue, onCancelRoute: gotoBrowse })(gotoEdit)
  };

  renderList() {
    const { foundIssues, linkedIssues } = this.props;

    const linked = linkedIssues.map(issue => issue.key);

    const mapper = issue => {
        if (-1 === linked.indexOf(issue.key)) {
          return <IssueListElement key={issue.key} issue={issue} edit={this.edit} link={this.link} />
        }

      return <IssueListElement key={issue.key} issue={issue} edit={this.edit} unlink={this.unlink} />
    };

    return <List> { foundIssues.map(mapper) } </List>
  }

  renderForm()
  {
    return <Form name="search_issue" >
      <Input name={"search"} onChange={this.onSearchThrottled} onKeyDown={this.onSearchThrottled} />
    </Form>;
  }

  render()
  {
    return [
      this.renderForm(),
      this.state.ui === 'normal' && this.props.foundIssues.length  ? this.renderList() : null,
      this.state.ui === 'loading' ? <Loader /> : null
    ].filter(x => !!x);
  }
}

export default reduxConnector(
  ScreenBrowseIssues,
  {
    unlinkJiraIssue, linkJiraIssue, searchIssues
  },
  {
    foundIssues:  getFoundIssues,
    linkedIssues: getLinkedIssues,
    ticket:       getTicket
  }
);
