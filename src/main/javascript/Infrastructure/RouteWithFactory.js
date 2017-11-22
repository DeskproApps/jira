import React from 'react';
import PropTypes from 'prop-types';
import { Route } from '@deskpro/apps-sdk-react';

export class RouteWithFactory extends Route
{
  static propTypes = {
    /**
     * The name of the route.
     */
    factory: PropTypes.func,

  };

  render()
  {
    const { factory } = this.props;
    if (factory) {
      return factory();
    }
    return super.render();
  }
}
