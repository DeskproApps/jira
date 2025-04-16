import { useMemo } from "react";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { getCreateMeta, getFields, JiraError } from "../../api/api";
import type { DropdownItemType } from "@deskpro/deskpro-ui";
import type { ProjectElement, Issuetype } from "../../api/types/createMeta";
import type { FieldMeta } from "../../api/types/types";
import type { Settings } from "../../types";

type UseMetadata = (settings?: Settings, projectId?: ProjectElement["id"]) => {
  isLoading: boolean;
  projects: ProjectElement[];
  projectOptions: Array<DropdownItemType<ProjectElement["id"]>>;
  issueTypes: Issuetype[];
  issueTypeOptions: Array<DropdownItemType<Issuetype["id"]>>;
  fields: FieldMeta[];
};

const useMetadata: UseMetadata = (settings, projectId) => {
  const isValidSettings = Boolean(settings?.domain) && Boolean(settings?.username) && Boolean(settings?.api_key);

  const fields = useQueryWithClient(
    ["fields", settings?.api_key ?? "", settings?.username ?? "", settings?.domain ?? ""],
    (client) => getFields(client, settings).catch((e) => {
      if (e instanceof JiraError) {
        // Prevent the field mapping section from crashing if the user inputs invalid credentials
        if (e.status === 404) {
          return []
        }
        // Carry on (Throw API Error)
        throw e
      }
        // Carry on (Throw any other exception)
      throw e
    }),
    { enabled: isValidSettings },
  );

  const createMeta = useQueryWithClient(
    ["createMetaQuery", settings?.api_key ?? "", settings?.username ?? "", settings?.domain ?? ""],
    (client) => getCreateMeta(client, settings).catch((e) => {
      if (e instanceof JiraError) {
        // Prevent the field mapping section from crashing if the user inputs invalid credentials
        if (e.status === 404) {
          return {
            projects: []
          }
        } 
        // Carry on (Throw API Error)
        throw e
      }
        // Carry on (Throw any other exception)
      throw e
    }),
    { enabled: isValidSettings },
  );

  const projectOptions: Array<DropdownItemType<ProjectElement["id"]>> = useMemo(() => {
    const projects = createMeta.data?.projects ?? [];

    if (!projects.length) {
      return [{ type: "header", label: "No project(s) found" }];
    }

    return projects.map((project) => ({
      key: project.name,
      label: project.name,
      value: project.id,
      type: "value" as const,
    }));
  }, [createMeta.data?.projects]);

  const issueTypes = useMemo(() => {
    const project = (createMeta.data?.projects ?? []).find((project) => {
      return Boolean(projectId) && project.id === projectId;
    });

    return project?.issuetypes ?? [];
  }, [projectId, createMeta.data?.projects]);

  const issueTypeOptions: Array<DropdownItemType<Issuetype["id"]>> = useMemo(() => {
    const project = (createMeta.data?.projects ?? []).find((project) => {
      return Boolean(projectId) && project.id === projectId;
    });

    if (!project?.issuetypes.length) {
      return [{ type: "header", label: "No Issue Type(s) found" }];;
    }

    return project.issuetypes.map((type) => ({
      key: type.name,
      label: type.name,
      value: type.id,
      type: "value" as const,
    }));
  }, [projectId, createMeta.data?.projects]);

  return {
    isLoading: [fields, createMeta].some(({ isLoading }) => isLoading),
    fields: fields.data ?? [],
    projects: createMeta.data?.projects ?? [],
    projectOptions,
    issueTypes,
    issueTypeOptions,
  };
};

export { useMetadata };
