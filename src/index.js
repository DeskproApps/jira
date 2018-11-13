import { AppFrame } from '@deskpro/apps-components';
import { createApp } from '@deskpro/apps-sdk';
import ReactDOM from 'react-dom';
import React from 'react';
import { Provider } from "react-redux";
import { createMemoryHistory as createHistory } from "history";

import './styles.css';
import { App, Preloader } from './App';
import { createNavigator } from './infrastructure';
import configureStore from './store';

const history = createHistory({
  initialEntries: ["loading"],
  initialIndex: 0
});


let store;
function getStore(dpapp) {

  if (store) {
    return Promise.resolve(store);
  }

  return configureStore(dpapp).then(newStore => {
    store = newStore;
    return store;
  })
}

createApp(dpapp => props => {
  let app = dpapp.getProperty('isPreRender') ? Promise.resolve(<Preloader />) : null;
  if (! app) {
    app = getStore(dpapp)
      .then(store => <AppFrame {...props}>
          <Provider store={store}>
            <App dpapp={dpapp} history={history} navigator={createNavigator(history)} />
          </Provider>
        </AppFrame>
      );
  }

  app.then(component => ReactDOM.render(component, document.getElementById('root')));
});
