import React from 'react';
import PropTypes from 'prop-types';
import { Routes, createSignInAction } from '../App'
import { Container, Heading, Button } from '@deskpro/react-components';

/**
 * Renders the authentication page.
 */
class ScreenAuth extends React.Component {
  static propTypes = {
    /**
     * Instance of sdk route.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/route.html
     */
    route:   PropTypes.object,

    dispatch:   PropTypes.func.isRequired
  };

  handleClick = () => {
    const { route, dispatch } = this.props;
    dispatch(createSignInAction()).then(() => route.to(Routes.linkedIssues));
  };

  /**
   * @returns {XML}
   */
  render() {
    return (
      <Container className="dp-jira-container">
        <Heading size={3}>
          Authenticate
        </Heading>
        <p>
          You must authenticate with Jira before you continue.
        </p>
        <Button onClick={this.handleClick}>
          Authenticate
        </Button>
      </Container>
    );
  }
}

export { ScreenAuth };
