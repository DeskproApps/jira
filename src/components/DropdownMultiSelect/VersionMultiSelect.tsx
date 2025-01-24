import { FC, useMemo, useState, useCallback } from "react";
import styled from "styled-components";
import {
  faCaretDown,
  faExternalLinkAlt,
  faHandPointer,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  Icon,
  Stack,
  AnyIcon,
  Dropdown,
  DropdownValueType,
  DropdownTargetProps,
  DivAsInputWithDisplay,
} from "@deskpro/deskpro-ui";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { getVersionsByProjectId } from "../../api/api";
import { Version } from "../../api/types/types";
import { Project } from "../../api/types/fieldsValue";

type Props = {
  projectId?: Project["id"];
  value?: Version[];
  onChange: (versions: Version[]) => void;
  error?: boolean;
};

const ItemContainer = styled(Stack)`
  margin-bottom: 4px;
  padding: 3px;
  border: 1px solid ${({ theme }) => theme.colors.grey20};
  border-radius: 5px;
  flex-wrap: wrap;
`;

const Item: FC<{
  version: Version,
  onRemove: (id: Version["id"]) => void,
}> = ({
  version,
  onRemove,
}) => {
  return (
    <ItemContainer
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        onRemove(version.id);
      }}
    >
      <Stack align="center" gap={4}>
        <span>{version?.name}</span>
        <Icon icon={faTimes as AnyIcon} />
      </Stack>
    </ItemContainer>
  );
};

const VersionMultiSelect: FC<Props> = ({ projectId, value, onChange, error }) => {
  const [input, setInput] = useState<string>("");
  const selectedVersionIds = useMemo(() => (value ?? []).map(({ id }) => id), [value]);

  const versions = useQueryWithClient(
    ["versions", projectId as Project["id"]],
    (client) => getVersionsByProjectId(client, projectId as Project["id"]),
    { enabled: Boolean(projectId) },
  );

  const options = useMemo(() => (versions.data ?? [])
    .filter(({ id }) => !selectedVersionIds.includes(id))
    .filter(({ name }) => name.toLowerCase().includes(input.toLowerCase()))
    .map((ver) => ({
      key: ver.id,
      label: ver.name,
      value: ver,
      type: "value" as const,
    })), [versions.data, selectedVersionIds, input]);

  const onRemove = useCallback((id: Version["id"]) => {
    const selectedVersion = selectedVersionIds
      .filter((verId) => verId !== id)
      .map((verId) => versions.data?.find(({ id }) => id === verId))
      .filter(Boolean) as Version[];

    onChange(selectedVersion);
  }, [selectedVersionIds, versions.data, onChange]);

  const onSelect = useCallback((option: DropdownValueType<Version>) => {
    return onChange([option.value, ...(value ?? [])] as Version[]);
  }, [value, onChange]);

  return (
    <Dropdown
      closeOnSelect={false}
      showInternalSearch
      inputValue={input}
      onInputChange={setInput}
      options={options}
      onSelectOption={onSelect}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer as AnyIcon}
      externalLinkIcon={faExternalLinkAlt as AnyIcon}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          placeholder={"Select value"}
          error={error}
          variant="inline"
          value={selectedVersionIds.length > 0
            ? (
              <Stack wrap="wrap">
                {selectedVersionIds.map((verId) => (
                  <Item
                    key={verId}
                    onRemove={onRemove}
                    version={versions.data?.find(({ id }) => id === verId) as Version}
                  />
                ))}
              </Stack>
            )
            : undefined
          }
          isVisibleRightIcon
          rightIcon={faCaretDown as AnyIcon}
          ref={targetRef}
          {...targetProps}
        />
      )}
    </Dropdown>
  );
};

export { VersionMultiSelect };
