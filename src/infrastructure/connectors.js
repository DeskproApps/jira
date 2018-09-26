import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


function noMap(state, ownProps)
{
  return {};
}

function mapPropFactoriesToProps(state, ownProps, propFactories)
{
  function reducer(acc, key) {
    acc[key] = propFactories[key](state);
    return acc;
  }

  return Object.keys(propFactories).reduce(reducer, {});
}

function mapActionCreatorsToProps(dispatch, ownProps, actionCreators)
{
  if (! ownProps) {
    return bindActionCreators(actionCreators, dispatch);
  }

  const missing = Object.keys(actionCreators).filter(key => !ownProps[key]);
  if (missing.length) {
    const creators = missing.reduce((acc, key) => {
      acc[key] = actionCreators[key];
      return acc
    }, {});
    return bindActionCreators(creators, dispatch);
  }

  return {}
}

/**
 * @param {function} Component
 * @param {object} actionCreators
 * @param {object} [propFactories]
 * @return {function}
 */
export function reduxConnector(Component, actionCreators, propFactories)
{
  let mapDispatchToProps;
  if (actionCreators && typeof actionCreators === 'object') {
    mapDispatchToProps = (dispatch, ownProps) => mapActionCreatorsToProps(dispatch, ownProps, actionCreators);
  } else {
    mapDispatchToProps = noMap
  }

  let mapStateToProps;
  if (propFactories && typeof propFactories === 'object') {
    mapStateToProps = (state, ownProps) =>  mapPropFactoriesToProps(state, ownProps, propFactories);
  } else {
    mapStateToProps = noMap
  }

  return connect(mapStateToProps, mapDispatchToProps)(Component);
}
