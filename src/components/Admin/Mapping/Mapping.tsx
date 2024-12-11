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
  onChange: (e: string, type: keyof Layout) => void;
  selectedSettings: Partial<Layout>;
};

const Mapping: FC<Props> = ({
  fields,
  onChange,
  projectOptions,
  issueTypeOptions,
  selectedSettings,
}) => {
  const onChangeProject = useCallback((projectId: ProjectElement["id"]|undefined) => {
    onChange(projectId || "", "project");
  }, [onChange]);

  const OnChangeIssueType = useCallback((issueTypeId: Issuetype["id"]|undefined) => {
    onChange(issueTypeId || "", "issuetype");
  }, [onChange]);

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
        onChange={onChange}
        selectedSettings={selectedSettings}
      />
    </>
  );
};

export { Mapping };
