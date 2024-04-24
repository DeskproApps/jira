import { useDeskproAppTheme } from "@deskpro/app-sdk";
import {
  AnyIcon,
  DivAsInput,
  Dropdown as DropdownComponent,
  DropdownTargetProps,
  Label,
  Stack,
} from "@deskpro/deskpro-ui";
import {
  faCaretDown,
  faCheck,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ReactNode, useMemo, useState } from "react";
type Props = {
  data?: {
    key: string;
    value: any;
  }[];
  onChange: (key: string) => void;
  value: any;
  error: boolean;
  multiple?: boolean;
  disabled?: boolean;
  valueAccessor?: (e: any) => any;
};
export const DropdownSelect = ({
  data,
  onChange,
  value,
  error,
  disabled,
  valueAccessor,
  multiple,
}: Props) => {
  const { theme } = useDeskproAppTheme();
  const [prompt, setPrompt] = useState<string>("");

  const accessValue = (e: any) => {
    return valueAccessor ? valueAccessor(e) : e;
  };
  const dataOptions = useMemo(() => {
    return data
      ?.filter((e) =>
        prompt ? e.key.toLowerCase().includes(prompt.toLowerCase()) : data,
      )
      ?.map((dataInList) => ({
        key: dataInList.key,
        label: <Label label={dataInList.key}></Label>,
        value: dataInList.value,
        type: "value" as const,
      }));
  }, [data, prompt]) as {
    value: string;
    key: string;
    label: ReactNode;
    type: "value";
  }[];

  const accessedValue = multiple
    ? (value ?? []).map(accessValue)
    : accessValue(value);

  return (
    <Stack
      vertical
      style={{ marginTop: "5px", color: theme?.colors.grey80, width: "100%" }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
      <DropdownComponent<any, HTMLDivElement>
        placement="bottom-start"
        onClose={() => setPrompt("")}
        options={dataOptions.map((e) => ({
          ...e,
          selected: ["number", "string"].includes(typeof value)
            ? accessValue(e.value) === value
            : value?.includes(accessValue(e.value)),
        }))}
        fetchMoreText={"Fetch more"}
        autoscrollText={"Autoscroll"}
        selectedIcon={faCheck as AnyIcon}
        externalLinkIcon={faExternalLinkAlt as AnyIcon}
        disabled={disabled}
        showInternalSearch
        onInputChange={setPrompt}
        searchPlaceholder="Search"
        onSelectOption={(option) => {
          onChange(
            multiple
              ? accessedValue?.includes(accessValue(option.value))
                ? value.filter(
                    (e: any) => accessValue(option.value) !== accessValue(e),
                  )
                : [...(value || []), option.value]
              : option.value,
          );
        }}
      >
        {({ targetProps, targetRef }: DropdownTargetProps<HTMLDivElement>) => (
          <DivAsInput
            error={error}
            ref={targetRef}
            {...targetProps}
            variant="inline"
            rightIcon={faCaretDown as AnyIcon}
            placeholder="Enter value"
            style={{ fontWeight: "400 !important" }}
            value={
              multiple
                ? dataOptions
                    .filter((e) => {
                      return accessedValue?.includes(accessValue(e.value));
                    })
                    .reduce(
                      (a, c, i, arr) =>
                        a + `${c.key}${i === arr.length - 1 ? "" : ", "} `,
                      "",
                    )
                : dataOptions.find((e) => accessValue(e.value) == accessedValue)
                    ?.key
            }
          />
        )}
      </DropdownComponent>
    </Stack>
  );
};
