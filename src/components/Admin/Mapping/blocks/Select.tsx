import { useState } from "react";
import {
  faTimes,
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Dropdown, RoundedLabelTag, DivAsInputWithDisplay } from "@deskpro/deskpro-ui";
import { optionsRenderer } from "./utils";
import type { AnyIcon, DropdownTargetProps, DropdownItemType, DropdownValueType } from "@deskpro/deskpro-ui";

const isValueType = <T,>(
  option?: DropdownItemType<T>
): option is DropdownValueType<T> => {
  return option?.type === "value";
};

type Props<T> = {
  options: Array<DropdownItemType<T>>;
  id?: string;
  value?: T;
  disabled?: boolean;
  onChange: (key: T|undefined) => void;
}

const Select = <T,>({
  value,
  options,
  onChange,
  ...props
}: Props<T>) => {
  const [input, setInput] = useState<string>("");
  const selectedOption = options.find((o) => (isValueType(o) && o.value === value));

  const selectedValue = isValueType(selectedOption) && selectedOption?.label || undefined;

  return (
    <Dropdown
      {...props}
      showInternalSearch
      options={options}
      inputValue={input}
      onInputChange={setInput}
      onSelectOption={(o) => onChange(o.value)}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer as AnyIcon}
      externalLinkIcon={faExternalLinkAlt as AnyIcon}
      optionsRenderer={optionsRenderer}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          placeholder="Select value"
          value={selectedValue && (
            <RoundedLabelTag
              label={selectedValue}
              backgroundColor="whitesmoke"
              textColor="brandPrimary"
              closeIcon={faTimes}
              withClose
              onCloseClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
            />
          )}
          rightIcon={faCaretDown as AnyIcon}
          isVisibleRightIcon
          ref={targetRef}
          {...targetProps}
        />
      )}
    </Dropdown>
  );
};

export { Select };
