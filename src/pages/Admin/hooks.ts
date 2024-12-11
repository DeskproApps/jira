import { useMemo } from "react";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { getCreateMeta, getFields } from "../../api/api";
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
    ["fields"],
    (client) => getFields(client, settings),
    { enabled: isValidSettings },
  );

  const createMeta = useQueryWithClient(
    ["createMetaQuery"],
    (client) => getCreateMeta(client, settings),
    { enabled: isValidSettings },
  );

  const projectOptions: Array<DropdownItemType<ProjectElement["id"]>> = useMemo(() => {
    const projects = createMeta.data?.projects ?? [];

    if (!projects.length) {
      return [{ type: "header", label: "No project(s) found" }];
    }

    return projects.map((p) => ({
      key: p.name,
      label: p.name,
      value: p.id,
      type: "value" as const,
    }));
  }, [createMeta.data?.projects]);

  const issueTypes = useMemo(() => {
    const project = (createMeta.data?.projects ?? []).find((p) => {
      return Boolean(projectId) && p.id === projectId;
    });

    return project?.issuetypes ?? [];
  }, [projectId, createMeta.data?.projects]);

  const issueTypeOptions: Array<DropdownItemType<Issuetype["id"]>> = useMemo(() => {
    const project = (createMeta.data?.projects ?? []).find((p) => {
      return Boolean(projectId) && p.id === projectId;
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
