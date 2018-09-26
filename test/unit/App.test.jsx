import React from 'react';
import renderer from 'react-test-renderer';
import { default as bootstrap } from './helpers'
import { Provider } from "react-redux";
import { App, routesEnum } from '../../src/App';

test('successfully render the loading screen', done => {

  const httpClient = () => Promise.resolve(null);
  const { store, dpapp, history, navigator } = bootstrap({ httpClient, initialRoute: routesEnum.ROUTE_LOADING });

  const component = renderer.create(
    <Provider store={store}>
      <App dpapp={dpapp} history={history} navigator={navigator}/>
    </Provider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  done();
});

test('successfully render the home screen', done => {

  const httpClient = () => Promise.resolve(null);
  const { store, dpapp, history, navigator } = bootstrap({ httpClient, initialRoute: routesEnum.ROUTE_HOME });

  const component = renderer.create(
    <Provider store={store}>
      <App dpapp={dpapp} history={history} navigator={navigator}/>
    </Provider>
  );

  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
  done();
});
