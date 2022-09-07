import {FC, useEffect, useState} from "react";
import { useDebouncedCallback } from "use-debounce";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import get from "lodash/get";
import { FieldHelperProps } from "formik";
import {
  Spinner,
  Infinite,
  Dropdown,
  DropdownValueType,
  DropdownHeaderType,
  useDeskproAppClient,
  DropdownTargetProps,
  dropdownRenderOptions,
  DivAsInputWithDisplay,
} from "@deskpro/app-sdk";
import {
  faCaretDown,
  faHandPointer,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { searchIssues } from "../../context/StoreProvider/api";
import { normalize } from "../../utils";

export interface DropdownWithSearchProps {
  helpers: FieldHelperProps<any>;
  id?: string;
  placeholder?: string;
  value?: any;
  disabled?: boolean;
}

export const DropdownWithSearch: FC<DropdownWithSearchProps> = ({ helpers, id, placeholder, value, ...props }) => {
  const { client } = useDeskproAppClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [parents, setParents] = useState<Record<string, any>>([]);
  const [parentOptions, setParentOptions] = useState<DropdownValueType<any>[] | DropdownHeaderType[]>([]);

  const getIssueTitle = (): string => {
    const issue = get(parents, [value], null);

    if (isEmpty(issue)) {
      return "";
    } else {
      return `[${issue.key}] ${issue.summary}`;
    }
  }

  const debouncedSearch = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      setParents([]);
      return;
    }

    setLoading(true);
    searchIssues(client, q)
        .then((stories) => setParents(normalize(stories, "key")))
        .finally(() => setLoading(false));
  }, 500);

  useEffect(() => {
    if (isEmpty(parents)) {
      setParentOptions([{
        type: "header",
        label: "No issues found.",
      }]);
    } else {
      setParentOptions(values(parents).map((issue) => ({
        key: issue.key,
        label: `[${issue.key}] ${issue.summary}`,
        value: issue.key,
        type: "value" as const,
      })))
    }
  }, [parents]);

  useEffect(() => {
    if (loading) {
      setParentOptions([{
        type: "header",
        label: (<div style={{ textAlign: "center" }}><Spinner size="small"/></div>),
      }]);
    }
  }, [loading]);

  return (
    <Dropdown
      {...props}
      showInternalSearch
      options={parentOptions}
      inputValue={searchQuery}
      onInputChange={(e) => {
        setSearchQuery(e);
        debouncedSearch(e);
      }}
      onSelectOption={(option) => {
        helpers.setTouched(true);
        helpers.setValue(option.value);
      }}
      fetchMoreText="Fetch more"
      autoscrollText="Autoscroll"
      selectedIcon={faHandPointer}
      externalLinkIcon={faExternalLinkAlt}
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
                  faHandPointer,
                  faExternalLinkAlt,
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
          value={getIssueTitle()}
          variant="inline"
          rightIcon={faCaretDown}
          ref={targetRef}
          {...targetProps}
          isVisibleRightIcon
        />
      )}
    </Dropdown>
  );
};
