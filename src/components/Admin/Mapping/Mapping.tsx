import { useCallback } from "react";
import { Property } from "@deskpro/app-sdk";
import { Select, Fields } from "./blocks";
import type { FC } from "react";
import type { DropdownItemType } from "@deskpro/deskpro-ui";
import type { Layout } from "../../../types";
import type { ProjectElement, Issuetype } from "../../../api/types/createMeta";
import type { FieldMeta } from "../../../api/types/types";

type Props = {
  fields: FieldMeta[];
  projectOptions: Array<DropdownItemType<ProjectElement["id"]>>;
  issueTypeOptions: Array<DropdownItemType<Issuetype["id"]>>;
  selectedSettings: Partial<Layout>;
  onUpdateMapping: (value: Array<FieldMeta["id"]>, keyName: keyof Layout) => void;
  onUpdateProject: (project: ProjectElement["id"]) => void;
  onUpdateIssueType: (issuetype: Issuetype["id"]) => void;
  onUpdateEnableMapping: () => void;
};

const Mapping: FC<Props> = ({
  fields,
  projectOptions,
  issueTypeOptions,
  selectedSettings,
  onUpdateMapping,
  onUpdateProject,
  onUpdateIssueType,
  onUpdateEnableMapping,
}) => {
  const onChangeProject = useCallback((projectId: ProjectElement["id"]|undefined) => {
    onUpdateProject(projectId || "");
  }, [onUpdateProject]);

  const OnChangeIssueType = useCallback((issueTypeId: Issuetype["id"]|undefined) => {
    onUpdateIssueType(issueTypeId || "");
  }, [onUpdateIssueType]);

  return (
    <>
      <Property
        label="Default Project"
        text={
          <Select<ProjectElement["id"]>
            options={projectOptions}
            onChange={onChangeProject}
            value={selectedSettings.project}
          />
        }
      />
      <Property
        label="Default Issue Type"
        text={
          <Select<Issuetype["id"]>
            options={issueTypeOptions}
            onChange={OnChangeIssueType}
            value={selectedSettings.issuetype}
          />
        }
      />
      <Fields
        fields={fields}
        selectedSettings={selectedSettings}
        onUpdateMapping={onUpdateMapping}
        onUpdateEnableMapping={onUpdateEnableMapping}
      />
    </>
  );
};

export { Mapping };
