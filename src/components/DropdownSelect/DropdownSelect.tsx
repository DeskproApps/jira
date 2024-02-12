import { FC, useState } from "react";
import {
  AnyIcon,
  DivAsInputWithDisplay,
  Dropdown,
  dropdownRenderOptions,
  DropdownTargetProps,
  DropdownValueType,
  Infinite,
} from "@deskpro/app-sdk";
import {
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FieldHelperProps } from "formik";

export interface DropdownSelectProps {
  helpers: FieldHelperProps<any>;
  options: DropdownValueType<any>[];
  id?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
  containerMaxHeight?: number;
}

export const DropdownSelect: FC<DropdownSelectProps> = ({
  helpers,
  id,
  placeholder,
  value,
  options,
  ...props
}: DropdownSelectProps) => {
  const [input, setInput] = useState<string>("");

  const selectedValue =
    options.filter((o) => o.value === value)[0]?.label ?? "";
  const filteredOptions = options.filter((opt) =>
    (opt.label as string).toLowerCase().includes(input.toLowerCase())
  );

  return (
    <Dropdown
      {...props}
      showInternalSearch
      options={filteredOptions}
      inputValue={input}
      onInputChange={setInput}
      onSelectOption={(option) => {
        helpers.setTouched(true);
        helpers.setValue(option.value);
      }}
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
        hideIcons
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
              dropdownRenderOptions(
                handleSelectOption,
                activeItem,
                activeSubItem,
                setActiveSubItem,
                "Fetch more",
                "Autoscroll",
                faHandPointer as AnyIcon,
                faExternalLinkAlt as AnyIcon,
                hideIcons,
                0
              )
            )}
          </div>
        </Infinite>
      )}
      hideIcons
    >
      {({ targetRef, targetProps }: DropdownTargetProps<HTMLDivElement>) => (
        <DivAsInputWithDisplay
          id={id}
          placeholder={placeholder}
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
