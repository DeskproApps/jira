
const ROUTE_HOME  =     'linkedIssues';
const ROUTE_BROWSE =    'browseIssues';
const ROUTE_CREATE =    'createIssue';
const ROUTE_EDIT =      'editIssue';
const ROUTE_SIGNIN  =   'signIn';
const ROUTE_LOADING =  'loading';

export const routesEnum =
{
  ROUTE_BROWSE,
  ROUTE_CREATE,
  ROUTE_EDIT,
  ROUTE_HOME,
  ROUTE_SIGNIN,
  ROUTE_LOADING
};

export function gotoHome(args)
{
  return function(history) {
    history.push('linkedIssues', args);
    history.go(1);
  };
}

export function gotoCreate(args)
{
  return function(history) {
    history.push('createIssue', args);
    history.go(1);
  }
}

export function gotoBrowse(args)
{
  return function(history) {
    history.push('browseIssues', args);
    history.go(1);
  }
}

export function gotoEdit(args)
{
  return function(history) {
    history.push('editIssue', args);
    history.go(1);
  }
}

export function gotoSignIn(args)
{
  return function(history) {
    history.push('signIn', args);
    history.go(1);
  }
}
