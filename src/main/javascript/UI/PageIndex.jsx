import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import { Tabs, TabLink, Section, Container } from '@deskpro/react-components';

import { TabCreateIssue } from '../CreateIssue';
import { TabBrowseIssues } from '../BrowseIssues';
import { TabLinkIssues } from '../LinkIssues';
import {Routes} from '../App'

export class PageIndex extends React.Component
{
  static propTypes = {
    linkedIssues: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      activePane: Routes.linkedIssues
    };
  }

  navigate(route)
  {
    this.setState({ activePane: route })
  }

  render() {
    const { activePane } = this.state;
    const navigate = this.navigate.bind(this);
    const { linkedIssues } = this.props;

    return (
      <div>
        <Tabs active={activePane} onChange={navigate}>
          <TabLink name={Routes.linkedIssues}>
            Link
          </TabLink>
          <TabLink name={Routes.createIssue}>
             Create
          </TabLink>
          <TabLink name={Routes.browseIssue}>
            Browse
          </TabLink>
        </Tabs>
        <Container className="dp-jira-container">
          <Section hidden={activePane !== Routes.createIssue}>
            <TabCreateIssue navigate={navigate} />
          </Section>
          <Section hidden={activePane !== Routes.linkedIssues}>
            <TabLinkIssues navigate={navigate} linkedIssues={linkedIssues} />
          </Section>
          <Section hidden={activePane !== Routes.browseIssue}>
            <TabBrowseIssues navigate={navigate} linkedIssues={linkedIssues} />
          </Section>
        </Container>
      </div>
    );
  }
}
