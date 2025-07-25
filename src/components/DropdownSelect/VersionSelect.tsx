import { FC, useMemo, useState } from "react";
import {
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
  AnyIcon,
  DivAsInputWithDisplay,
  Dropdown,
  DropdownTargetProps,
  DropdownValueType,
} from "@deskpro/deskpro-ui";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { Version } from "../../api/types/types";
import { Project } from "../../api/types/fieldsValue";
import { getProjectVersions } from "@/api/projects";

export type Props = {
  projectId?: Project["id"];
  value?: Version;
  error: boolean;
  onChange: (version: Version) => void;
}

const VersionSelect: FC<Props> = ({
  value,
  error,
  onChange,
  projectId,
}) => {
  const [input, setInput] = useState<string>("");

  const versions = useQueryWithClient(
    ["versions", projectId as Project["id"]],
    (client) => getProjectVersions(client, projectId as Project["id"]),
    { enabled: Boolean(projectId) },
  );

  const options: Array<DropdownValueType<Version>> = useMemo(() => {
    return (versions.data ?? [])
      .filter(({ name }) => name.toLowerCase().includes(input.toLowerCase()))
      .map((ver) => ({
        key: ver.id,
        label: ver.name,
        value: ver,
        type: "value" as const,
      }));
  }, [versions.data, input]);

  return (
    <Dropdown
      showInternalSearch
      options={options}
      inputValue={input}
      onInputChange={setInput}
      onSelectOption={(option) => onChange(option.value)}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer as AnyIcon}
      externalLinkIcon={faExternalLinkAlt as AnyIcon}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          error={error}
          placeholder={"Select value"}
          value={value?.name}
          variant="inline"
          rightIcon={faCaretDown as AnyIcon}
          ref={targetRef}
          {...targetProps}
          isVisibleRightIcon
        />
      )}
    </Dropdown>
  );
};

export { VersionSelect };
