import { useState } from "react";
import {
  AnyIcon,
  DivAsInputWithDisplay,
  Dropdown,
  dropdownRenderOptions,
  DropdownTargetProps,
  DropdownValueType,
  Infinite,
} from "@deskpro/deskpro-ui";
import {
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";

export type DropdownSelectProps<T> = {
  options: DropdownValueType<T>[];
  id?: string;
  value?: T;
  disabled?: boolean;
  error: boolean;
  containerMaxHeight?: number;
  onChange: (key: T) => void;
}

export const DropdownSelect = <T,>({
  value,
  options,
  error,
  onChange,
  ...props
}: DropdownSelectProps<T>) => {
  const [input, setInput] = useState<string>("");
  const selectedValue =
    value === undefined
      ? undefined
      : options.filter((o) => o.value === value)[0]?.label ?? "";

  const filteredOptions = options.filter((opt) =>
    (opt.label as string).toLowerCase().includes(input.toLowerCase()),
  );

  return (
    <Dropdown
      {...props}
      showInternalSearch
      options={filteredOptions}
      inputValue={input}
      onInputChange={setInput}
      onSelectOption={(option) => onChange(option.value)}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer as AnyIcon}
      externalLinkIcon={faExternalLinkAlt as AnyIcon}
      optionsRenderer={(
        opts,
        handleSelectOption,
        activeItem,
        activeSubItem,
        setActiveSubItem,
        hideIcons,
      ) => (
        <Infinite
          maxHeight={"30vh"}
          anchor={false}
          scrollSideEffect={() => setActiveSubItem(null)}
          fetchMoreText="Fetch more"
          autoscrollText="Autoscroll"
        >
          <div style={{ maxHeight: "30vh" }}>
            {opts.map(
              dropdownRenderOptions({
                handleSelectOption,
                activeItem,
                activeSubItem,
                setActiveSubItem,
                fetchMoreText: "Fetch more",
                autoscrollText: "Autoscroll",
                selectedIcon: faHandPointer as AnyIcon,
                externalLinkIcon: faExternalLinkAlt as AnyIcon,
                hasSelectedItems: false,
                hasExpandableItems: false,
                hideIcons,
                setActiveValueIndex: () => {},
                valueOptions: [],
              }),
            )}
          </div>
        </Infinite>
      )}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          error={error}
          placeholder={"Select value"}
          value={selectedValue}
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
