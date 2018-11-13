import React from 'react';
import { Action, ActionBar } from '@deskpro/apps-components';

export class Preloader extends React.PureComponent
{
  render()
  {
    return (
      <ActionBar key="linked-issues-actions" title="Linked Issues">
        <Action icon="add" label="Add" onClick={this.gotoCreate}/>
        <Action icon="search" label="Find" onClick={this.gotoBrowse}/>
      </ActionBar>
    );
  }
}

export default Preloader;
