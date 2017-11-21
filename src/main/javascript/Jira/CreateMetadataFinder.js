
const parseProjectKey = project => {

  if (typeof project === 'string') {
    return project;
  }

  if (typeof project === 'object' && typeof project.key === 'string') {
    return project.key
  }

  throw new Error('could not parse the project key')
};

const parseIssueTypeId = issueType => {

  if (typeof issueType === 'string' || typeof issueType === 'number') {
    return issueType;
  }

  if (typeof issueType === 'object' && typeof issueType.id === 'string') {
    return issueType.id
  }

  throw new Error('could not parse the issue type id')
};

export class CreateMetadataFinder
{
  constructor(metadata)
  {
    this.state = metadata;
  }

  /**
   * @return {Array}
   */
  getProjectList()
  {
    const { projects } = this.state;
    if (projects instanceof Array) {
      return projects.map(({ avatarUrls, id, key, name }) => ({ avatarUrls, id, key, name }));
    }
    return [];
  }

  /**
   * @return {Array}
   */
  getIssueTypeList(project)
  {
    try {
      const projectKey = parseProjectKey(project);
      const { projects } = this.state;

      return  projects
        .filter(({ key, id }) => key === projectKey || "" + id === "" + projectKey )
        .reduce((acc, { issuetypes }) => acc.concat(issuetypes), [])
        .map(({id, name}) => ({id, name}))
      ;

    } catch (e) {
      return [];
    }
  }

  /**
   * @return {Array}
   */
  getFieldLists(project, issueType)
  {
    try {
      const issueId = parseIssueTypeId(issueType);
      const projectKey = parseProjectKey(project);
      const { projects } = this.state;

      return projects
        .filter(({ key, id }) => key === projectKey || "" + id === "" + projectKey )
        .reduce((acc, { issuetypes }) => acc.concat(issuetypes), [])
        .filter(({ id }) => id === issueId)
        .reduce((acc, { fields }) => {
          return acc.concat(Object.keys(fields).map(key => fields[key]));
        }, [])

    } catch (e) {
      return [];
    }
  }
}
