import ReactDOM from 'react-dom';
import { DeskproSDK, configureStore } from '@deskpro/apps-sdk-react';
import { App } from './App';

export function runApp(app) {
  const store = configureStore(app);

  ReactDOM.render(
    <DeskproSDK dpapp={app} store={store} component={App} />,
    document.getElementById('deskpro-app')
  );
}
