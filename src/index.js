import { AppFrame } from '@deskpro/apps-components';
import { createApp } from '@deskpro/apps-sdk';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from "react-redux";
import { createMemoryHistory as createHistory } from "history";

import './styles.css';
import { App } from './App';
import { createNavigator } from './infrastructure';
import configureStore from './store';

const history = createHistory({
  initialEntries: ["loading"],
  initialIndex: 0
});

createApp(dpapp => props => {
  configureStore(dpapp).then(store =>
    ReactDOM.render(
      <AppFrame {...props}>
        <Provider store={store}>
          <App dpapp={dpapp} history={history} navigator={createNavigator(history)} />
        </Provider>
      </AppFrame>,
      document.getElementById('root')
    )
  );
});
