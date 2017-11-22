export { RouteWithFactory } from './RouteWithFactory'
export { RoutesContainer } from './RoutesContainer'

export function createThrottle (callback, delay)
{
  let isThrottled = false, args, context;

  function throttle() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }


    isThrottled = true;
    callback.apply(this, arguments);

    setTimeout(() => {
      isThrottled = false;
      if (args) {
        throttle.apply(context, args);
        args = context = null;
      }
    }, delay);
  }

  return throttle;
}

export const createReducerChain = reducers => (state, action) =>
{
  let finalState = state;
  for (const reducer of reducers) {
    finalState = reducer(finalState, action);
  }

  return finalState;
};
