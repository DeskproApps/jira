import { ProjectElement } from "../api/types/createMeta";
import { JiraIssueType, JiraProject } from "../components/Mutate/types";

const isNeedField = ({
  projects,
  fieldName,
  projectId,
  issueTypeId,
}: {
  projects: ProjectElement[];
  fieldName: string;
  projectId: JiraProject["id"];
  issueTypeId: JiraIssueType["id"];
}): boolean => {
  if (!Array.isArray(projects) || projects.length === 0) {
    return false;
  }

  const project = projects.find(({ id }: JiraProject) => id === projectId);

  if (!project) {
    return false;
  }

  const issueType = project.issuetypes.find(({ id }) => id === issueTypeId);

  return issueType?.fields?.[fieldName] !== undefined;
};

export { isNeedField };
