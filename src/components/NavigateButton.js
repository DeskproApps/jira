import React from 'react';
import { Button } from '@deskpro/apps-components';

export class NavigateButton extends React.PureComponent {

  onClick = () => {
    const { navigator, route } = this.props;
    navigator()(route);
  };

  render()
  {
    const { navigator, route, ...buttonProps } = this.props;
    return <Button {...buttonProps} type={"submit"} onClick = {this.onClick} />
  }
}


