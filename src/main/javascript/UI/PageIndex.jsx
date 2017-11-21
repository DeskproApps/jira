import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from '@deskpro/apps-sdk-react';

import { Tabs, TabLink, Container } from '@deskpro/react-components';

import { TabCreateIssue } from '../CreateIssue';
import { TabBrowseIssues } from '../BrowseIssues';
import { TabLinkIssues } from '../LinkIssues';
import { Routes as AppRoutes } from '../App'

export class PageIndex extends React.PureComponent
{
  static propTypes = {

    dispatch: PropTypes.func.isRequired,

    linkedIssues: PropTypes.array.isRequired,

    foundIssues: PropTypes.array.isRequired,

    route:   PropTypes.object.isRequired
  };

  render() {
    const { route, linkedIssues, dispatch, foundIssues } = this.props;

    return (
      <div>
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
        <Container className="dp-jira-container">
          <Routes>
            <Route location={AppRoutes.createIssue} >
              <TabCreateIssue dispatch={dispatch} route={route} comment={route.params.comment} />
            </Route>
            <Route defaultRoute location={AppRoutes.linkedIssues}  >
              <TabLinkIssues dispatch={dispatch} linkedIssues={linkedIssues} />
            </Route>
            <Route location={AppRoutes.browseIssue}>
              <TabBrowseIssues dispatch={dispatch} route={route} linkedIssues={linkedIssues} foundIssues={foundIssues}/>
            </Route>
            <Route defaultRoute>
              <div/>
            </Route>
          </Routes>
        </Container>
      </div>
    );
  }
}
