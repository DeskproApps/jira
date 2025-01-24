import { FC, useMemo, useState, useCallback } from "react";
import styled, { DefaultTheme } from "styled-components";
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
import { getGroups } from "../../api/api";
import { GroupPicker } from "../../api/types/types";

type Props = {
  value?: GroupPicker[];
  onChange: (groups: GroupPicker[]) => void;
  error?: boolean;
};

const ItemContainer = styled(Stack)`
  margin-bottom: 4px;
  padding: 3px;
  border: 1px solid ${({ theme }) => (theme as DefaultTheme).colors.grey20};
  border-radius: 5px;
  flex-wrap: wrap;
`;

const Item: FC<{
  group: GroupPicker,
  onRemove: (name: GroupPicker["name"]) => void,
}> = ({
  group,
  onRemove,
}) => {
  return (
    <ItemContainer
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        onRemove(group.name);
      }}
    >
      <Stack align="center" gap={4}>
        <span>{group?.name}</span>
        <Icon icon={faTimes as AnyIcon} />
      </Stack>
    </ItemContainer>
  );
};

const GroupMultiSelect: FC<Props> = ({ value, onChange, error }) => {
  const [input, setInput] = useState<string>("");
  const selectedGroupNames = useMemo(() => (value ?? []).map(({ name }) => name), [value]);

  const groups = useQueryWithClient(["groups"], getGroups);

  const options = useMemo(() => (groups.data?.groups ?? [])
    .filter(({ name }) => name.toLowerCase().includes(input.toLowerCase()))
    .filter(({ name }) => !selectedGroupNames.includes(name))
    .map((group) => ({
      key: group.name,
      label: group.name,
      value: group,
      type: "value" as const,
    })), [groups.data?.groups, selectedGroupNames, input]);

  const onRemove = useCallback((name: GroupPicker["name"]) => {
    const selectedVersion = selectedGroupNames
      .filter((groupName) => groupName !== name)
      .map((groupName) => groups.data?.groups?.find(({ name }) => groupName === name))
      .filter(Boolean) as GroupPicker[];

    onChange(selectedVersion);
  }, [selectedGroupNames, groups.data?.groups, onChange]);

  const onSelect = useCallback((option: DropdownValueType<GroupPicker>) => {
    return onChange([option.value, ...(value ?? [])] as GroupPicker[]);
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
          value={selectedGroupNames.length > 0
            ? (
              <Stack wrap="wrap">
                {selectedGroupNames.map((groupName) => (
                  <Item
                    key={groupName}
                    onRemove={onRemove}
                    group={groups.data?.groups?.find(({ name }) => name === groupName) as GroupPicker}
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

export { GroupMultiSelect };

