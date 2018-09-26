export function createNavigator(history)
{
  function navigate(...args) {

    if (args.length === 0) {
      return (route) => route(null)(history);
    }

    if (args.length === 1) {
      const [ routeArgs ] = args;
      return (route) => route(routeArgs)(history);
    }

    if (args.length === 2) {
      const [route, routeArgs] = args;
      if (typeof route === 'string') {
        history.push(route, routeArgs);
        history.go(1);
        return;
      }
    }
    throw new Error('navigate invocation failure')
  }

  return navigate;
}
