import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from '@deskpro/apps-sdk-react';

/**
 * Ensures the Routes children are of type Route
 *
 * @returns {*}
 */
const childrenPropType = (props, propName, componentName) => {
  const prop = props[propName];
  let error  = null;
  React.Children.forEach(prop, (child) => {
    if (child.type !== Route && !(child.type.prototype instanceof Route) ) {
      error = new Error(`${componentName} children should be of type 'Route' or extend 'Route'`);
    }
  });

  return error;
};

export class RoutesContainer extends Routes
{
  static propTypes = {
    /**
     * Child components.
     */
    children: childrenPropType
  };

  /**
   * Creates or clones the component stored in the given route
   *
   * @param {Route} route
   * @returns {XML}
   */
  createRouteComponent = (route) =>
  {
    if (route.props.factory) {
      return route.props.factory(this.context.route);
    }

    if (route.props.component) {
      return React.createElement(route.props.component);
    }
    return React.cloneElement(React.Children.only(route.props.children));
  };

}


