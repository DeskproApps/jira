import React from 'react';

import { Select } from '@deskpro/react-components';

export class StatefulSelect extends React.Component
{
  static propTypes = Select.propTypes;

  constructor(props)
  {
    super(props);
    this.initState();
  }

  initState()
  {
    this.state = { value: this.props.value };
  }

  handleChange = (value) => {
    this.setState({ value });
    this.props.onChange(value, this.props.name);
  };

  onChange(value, name)
  {
    this.setState({ value });
    if (this.props.onChange) {
      this.props.onChange(value, name);
    }
  }

  render()
  {
    const { value } = this.state;
    return (<Select {...this.props} value={value} onChange={ this.onChange.bind(this) }/>);
  }
}
