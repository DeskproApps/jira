import { FC, useMemo, useState, useCallback } from "react";
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
import { getGroups } from "../../api/api";
import { GroupPicker } from "../../api/types/types";

export type Props = {
  value?: GroupPicker;
  error: boolean;
  onChange: (group: GroupPicker) => void;
}

const GroupSelect: FC<Props> = ({ value, error, onChange }) => {
  const [input, setInput] = useState<string>("");

  const groups = useQueryWithClient(["groups"], getGroups);

  const options: Array<DropdownValueType<GroupPicker>> = useMemo(() => {
    return (groups.data?.groups ?? [])
      .filter(({ name }) => name.toLowerCase().includes(input.toLowerCase()))
      .map((group) => ({
        key: group.name,
        label: group.name,
        value: group,
        type: "value" as const,
      }));
  }, [groups.data?.groups, input]);

  const onSelect = useCallback((option: DropdownValueType<GroupPicker>) => {
    return onChange(option.value);
  }, [onChange]);

  return (
    <Dropdown
      showInternalSearch
      options={options}
      inputValue={input}
      onInputChange={setInput}
      onSelectOption={onSelect}
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

export { GroupSelect };
