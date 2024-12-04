import { useDeskproAppTheme } from "@deskpro/app-sdk";
import {
  AnyIcon,
  DivAsInputWithDisplay,
  Dropdown,
  DropdownTargetProps,
  DropdownValueType,
  Icon,
  Infinite,
  Stack,
  dropdownRenderOptions,
} from "@deskpro/deskpro-ui";
import {
  faCaretDown,
  faExternalLinkAlt,
  faHandPointer,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { Option } from "../../api/types/createMeta";
import { isPrimitive } from "../../utils";

type DropdownOption = Option["id"]|Option;

export type DropdownMultiSelectProps = {
  options: DropdownValueType<DropdownOption>[];
  id?: string;
  values?: Option[];
  error: boolean;
  onChange: (key: DropdownOption[]) => void;
  valueAccessor: (e: DropdownOption) => DropdownOption;
}

export const DropdownMultiSelect = ({
  values,
  options,
  error,
  onChange,
  valueAccessor,
}: DropdownMultiSelectProps) => {
  const { theme: { colors } } = useDeskproAppTheme();
  const [input, setInput] = useState<string>("");
  const vals = Array.isArray(values) ? values : [];
  const accessedVals = vals.map(valueAccessor);

  const valLabels = vals.map((v) => {
    const option = options.find((o) => {
      return valueAccessor(o.value) === valueAccessor(v);
    });

    if (!option) return [v, v, colors.grey20];

    return [valueAccessor(option.value), option.label, colors.grey20];
  });

  const fixedOptions = options.filter((o) => {
    return !accessedVals.includes(valueAccessor(o.value));
  });

  const filteredOptions = fixedOptions.filter((opt) => {
    if (typeof opt?.label === "string") {
      return opt.label?.toLowerCase().includes(input.toLowerCase());
    }

    return false
  });

  return (
    <Dropdown
      closeOnSelect={false}
      showInternalSearch
      inputValue={input}
      onInputChange={setInput}
      options={filteredOptions}
      onSelectOption={(option) => {
        onChange([option.value, ...vals]);
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
        hideIcons,
      ) => (
        <Infinite
          maxHeight={"40vh"}
          anchor={false}
          scrollSideEffect={() => setActiveSubItem(null)}
          fetchMoreText="Fetch more"
          autoscrollText="Autoscroll"
        >
          <div style={{ maxHeight: "40vh" }}>
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
          placeholder={"Select value"}
          error={error}
          variant="inline"
          value={
            !!valLabels && !!valLabels.length ? (
              <Stack align="center" gap={4} wrap="wrap">
                {valLabels.map(([val, label], idx: number) => (
                  <Stack
                    style={{
                      border: `1px solid ${colors.grey20}`,
                      padding: "3px",
                      borderRadius: "5px",
                    }}
                    key={idx}
                    onClick={(e) => {
                      e.preventDefault();
                      onChange(vals.filter((v) => valueAccessor(v) !== val));
                    }}
                  >
                    <Stack align="center">
                      <span style={{ marginRight: "4px" }}>
                        {isPrimitive(label) ? label : `${valueAccessor(label as Option) as string}`}
                        </span>
                      <Icon icon={faTimes as AnyIcon} />
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            ) : undefined
          }
          rightIcon={faCaretDown as AnyIcon}
          ref={targetRef}
          {...targetProps}
          isVisibleRightIcon
        />
      )}
    </Dropdown>
  );
};
