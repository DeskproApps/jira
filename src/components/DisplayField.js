import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Group } from '../Forms';

export class Component extends React.PureComponent
{
  render()
  {
    return (
      <div className="dp-input dp-input--readonly">
        <input {...this.props} className="jira-input--readonly" disabled="disabled"  />
      </div>
    );
  }
}

/**
 * Renders an input element using @deskpro/react-components and redux-form.
 *
 * @see https://redux-form.com/7.0.4/docs/api/field.md/#2-a-stateless-function
 */
const Display = ({ input, label, meta, ...props }) => (
  <Group label={label} error={meta.touched ? meta.error : ''} {...props}>
    <Component {...input} />
  </Group>
);

/**
 * Connects the field to the Redux store.
 */
export const DisplayField = props => (
  <Field {...props} component={Display} />
);


DisplayField.propTypes = {
  /**
   * The name of the form field.
   */
  name:     PropTypes.string.isRequired,
};

