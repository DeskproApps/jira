import React from 'react';
import PropTypes from 'prop-types';
import { Route, LinkButton } from '@deskpro/apps-sdk-react';
import { RouteWithFactory, RoutesContainer } from '../Infrastructure';

import { Tabs, TabLink, Container,Button } from '@deskpro/react-components';

import { TabCreateIssue, ScreenEditIssue } from '../CreateIssue';
import { TabBrowseIssues } from '../BrowseIssues';
import { TabLinkIssues } from '../LinkIssues';
import { Routes as AppRoutes } from '../App'

export class UI extends React.PureComponent
{
  static propTypes = {

    dispatch: PropTypes.func.isRequired,

    linkedIssues: PropTypes.array.isRequired,

    foundIssues: PropTypes.array.isRequired
  };

  render() {
    return (
      <RoutesContainer>
        <RouteWithFactory location={AppRoutes.createIssue} factory={this.renderTabCreateIssue} />
        <RouteWithFactory location={AppRoutes.linkedIssues}  factory={this.renderTabLinkIssues} />
        <RouteWithFactory location={AppRoutes.browseIssue} factory={this.renderTabBrowseIssues} />
        <RouteWithFactory location={AppRoutes.editIssue} factory={ this.renderScreenEdit } />
        <Route defaultRoute>
          <div/>
        </Route>
      </RoutesContainer>
    );
  }

  renderTabs = (route) =>
  {
    return (
      <Tabs active={route.location} onChange={tab => route.to(tab)}>
        <TabLink name={AppRoutes.linkedIssues}>
          Link
        </TabLink>
        <TabLink name={AppRoutes.createIssue}>
          Create
        </TabLink>
        <TabLink name={AppRoutes.browseIssue}>
          Browse
        </TabLink>
      </Tabs>
    );
  };

  renderTabCreateIssue = (route) =>
  {
    const { linkedIssues, dispatch, foundIssues } = this.props;
    return (
      <div>
        {this.renderTabs(route)}
        <Container className="dp-jira-container">
          <TabCreateIssue dispatch={dispatch} route={route} comment={route.params.comment} />
        </Container>
      </div>
    );
  };

  renderTabLinkIssues = (route) =>
  {
    const { linkedIssues, dispatch, foundIssues } = this.props;
    return (
      <div>
        {this.renderTabs(route)}
        <Container className="dp-jira-container">
          <TabLinkIssues dispatch={dispatch} route={route} linkedIssues={linkedIssues} />
        </Container>

      </div>
    );
  };

  renderTabBrowseIssues = (route) =>
  {
    const { linkedIssues, dispatch, foundIssues } = this.props;
    return (
      <div>
        {this.renderTabs(route)}
        <Container className="dp-jira-container">
          <TabBrowseIssues dispatch={dispatch} route={route} linkedIssues={linkedIssues} foundIssues={foundIssues}/>
        </Container>
      </div>
    );
  };

  renderScreenEdit = (route) =>
  {
    const { dispatch } = this.props;

    return (
      <Container className="dp-jira-container">
        <LinkButton to="linkedIssues">Back</LinkButton>
        <ScreenEditIssue dispatch={dispatch} route={route} issue={route.params.issue}/>
      </Container>
    );
  }

}
