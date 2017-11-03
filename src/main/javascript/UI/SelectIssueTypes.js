import React from 'react';
import PropTypes from 'prop-types';

import { Select } from '@deskpro/react-components';

export class SelectIssueTypes  extends React.Component
{
  static get className() {  return SelectIssueTypes.prototype.constructor.name }

  static propTypes = {
    /**
     * CSS classes to apply to the element.
     */
    options:   PropTypes.arrayOf(PropTypes.object).isRequired,
    /**
     * Name of the form element.
     */
    name:        PropTypes.string,

    /**
     * The id of the element when in a group.
     */
    id:        PropTypes.string,

    /**
     * The id of the element when in a group.
     */
    // value: PropTypes.unionOf(
    //   PropTypes.string,
    //   PropTypes.object,
    // ),
    value: PropTypes.string,

    /**
     * Called when the selected value changes.
     */
    onChange:    PropTypes.func,

    // /**
    //  * Array of values to
    //  */
    // options:     PropTypes.arrayOf(
    //   PropTypes.shape({
    //     label: PropTypes.node,
    //     value: PropTypes.node.isRequired,
    //   })
    // ).isRequired,
  };

  convertOptions(values)
  {
    return values.map(({ id, name }) => ({ label: name, value: id }))
  }

  render()
  {
    const { name, options, onChange, id, value } = this.props;
    const selectValue = typeof value === 'string' || !value ? value : value.id;

    return (
      <Select
        id={ id }
        name={ name }
        value={ selectValue }
        validate={false}
        options={ this.convertOptions(options) }
        onChange={ onChange }
      />
    );

  }
}
