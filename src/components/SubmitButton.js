import React from 'react';
import { Button } from '@deskpro/apps-components';

export class SubmitButton extends React.PureComponent {
  render()
  {
    return <Button {...this.props} type={"submit"}/>
  }
}


