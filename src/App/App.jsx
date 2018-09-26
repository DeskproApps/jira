import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch,  } from 'react-router'
import { Loader, Panel, Level, Action, ActionBar } from '@deskpro/apps-components';

import { ScreenCreateIssue, ScreenEditIssue } from '../CreateIssue';
import { ScreenBrowseIssues } from '../BrowseIssues';
import { ScreenLinkIssues } from '../LinkIssues';
import { ScreenAuth } from '../Security';

import { routesEnum, gotoHome, gotoSignIn } from './navigation';
import { DeskproPortal } from '../Comments';
import { verifyAccess } from '../Security'
import { reduxConnector } from "../infrastructure";
import {gotoBrowse, gotoCreate} from "./index";

export class App extends React.PureComponent
{
  static propTypes = {
    dpapp:        PropTypes.object.isRequired,
    history:      PropTypes.object,
    navigator:    PropTypes.func.isRequired,
    verifyAccess: PropTypes.func.isRequired,
  };

  componentDidMount()
  {
    const { verifyAccess, dpapp, navigator } = this.props;

    verifyAccess()
      .then(() => navigator()(gotoHome))
      .catch(err => { navigator()(gotoSignIn); })
      .catch(dpapp.ui.showErrorNotification)
    ;
  }

  gotoHome = () => {
    const { navigator } = this.props;
    navigator()(gotoHome)
  };

  gotoCreate = () => {
    const { navigator } = this.props;
    navigator()(gotoCreate)
  };

  gotoBrowse = () => {
    const { navigator } = this.props;
    navigator()(gotoBrowse)
  };

  render()
  {
    const { navigator, dpapp } = this.props;
    return [
      <DeskproPortal navigator={navigator} dpapp={dpapp}/>,
      this.renderRouter()
    ];
  }

  renderRouter()
  {
    const { history } = this.props;

    return <Router history={history} >
      <Switch>
        <Route path={routesEnum.ROUTE_SIGNIN} render={this.renderSignIn} />
        <Route path={routesEnum.ROUTE_CREATE} render={this.renderScreenCreateIssue} />
        <Route path={routesEnum.ROUTE_HOME} render={this.renderScreenLinkIssues} />
        <Route path={routesEnum.ROUTE_BROWSE} render={this.renderScreenBrowseIssues} />
        <Route path={routesEnum.ROUTE_EDIT} render={this.renderScreenEdit} />
        <Route path={routesEnum.ROUTE_LOADING} render={this.renderLoader} />
        <Route render={this.renderLoader} />
      </Switch>
    </Router>
  }

  renderLoader = () =>
  {
    return <Level><Loader /></Level>;
  };

  renderSignIn = ({match, location, history}) =>
  {
    const { navigator, dpapp } = this.props;
    return <ScreenAuth dpapp={dpapp} navigator={navigator} />
  };


  renderScreenCreateIssue = ({match, location, history}) =>
  {
    let comment = null;
    if (location.state) {
      comment = location.state.comment
    }

    const { navigator, dpapp } = this.props;
    return <Panel title={"Create an issue"} border={"none"}>
      <Action icon={'close-heavy'} label={"Go back"} onClick={this.gotoHome}/>
      <ScreenCreateIssue dpapp={dpapp} navigator={navigator} comment={comment} />
    </Panel>;
  };

  renderScreenLinkIssues = ({match, location, history}) =>
  {
    const { navigator, dpapp } = this.props;

    return [
      <ActionBar key={"linked-issues-actions"} title={"Linked Issues"}>
        <Action icon={'add'} label={"Add"} onClick={this.gotoCreate}/>
        <Action icon={'search'} label={"Find"} onClick={this.gotoBrowse}/>
      </ActionBar>,
      <ScreenLinkIssues key={"screen-link-issues"} dpapp={dpapp} navigator={navigator} onCancelRoute={gotoHome} />
    ]
  };

  renderScreenBrowseIssues = ({match, location, history}) =>
  {
    const { navigator, dpapp } = this.props;

    return <Panel title={"Find issues"} border={"none"}>
      <Action icon={'close-heavy'} label={"Go back"} onClick={this.gotoHome}/>
      <ScreenBrowseIssues dpapp={dpapp} navigator={navigator} />
    </Panel>;

  };

  renderScreenEdit = ({match, location, history}) =>
  {
    const { issue, onCancelRoute } = location.state;
    const { navigator, dpapp } = this.props;

    return (
      <Panel title={"Edit issue"} border={"none"}>
        <Action icon={'close-heavy'} label={"Go back"} onClick={this.gotoHome}/>
        <ScreenEditIssue dpapp={dpapp} navigator={navigator} issue={issue} />
      </Panel>
    );
  }

}

export default reduxConnector(App, { verifyAccess }, {});
