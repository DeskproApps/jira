import React from 'react';
import PropTypes from 'prop-types';
import { gotoHome } from '../App'
import { signIn } from './actions'
import { reduxConnector } from "../infrastructure";

import { Panel, Button } from '@deskpro/apps-components';

/**
 * Renders the authentication page.
 */
class ScreenAuth extends React.Component {
  static propTypes = {
    dpapp:      PropTypes.object.isRequired,
    navigator:  PropTypes.func.isRequired,
    signIn:     PropTypes.func.isRequired
  };

  handleClick = () => {
    const { signIn, dpapp, navigator } = this.props;
    signIn(dpapp).then(() => navigator()(gotoHome));
  };

  /**
   * @returns {XML}
   */
  render() {
    return (
      <Panel title={"Authenticate"} className="dp-jira-container">
        <p>
          You must authenticate with JIRA before you continue.
        </p>
        <Button onClick={this.handleClick}>
          Authenticate
        </Button>
      </Panel>
    );
  }
}

export { ScreenAuth };

export default reduxConnector(
  ScreenAuth,
  { signIn },
  {}
);
