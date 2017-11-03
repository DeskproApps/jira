export class JiraEndpoint
{
  constructor({ url, headers })
  {
    this.props = { url, headers };
  }

  get url() { return this.props.url }

  initRequest({ headers, ...rest })
  {
    return {
      ...rest,
      headers: {
        ...headers,
        ...this.props.headers
      }
    };
  }


}
