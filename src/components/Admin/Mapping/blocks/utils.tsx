import { faHandPointer, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { dropdownRenderOptions, Infinite } from "@deskpro/deskpro-ui";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { AnyIcon, DropdownItemType, DropdownValueType } from "@deskpro/deskpro-ui";

type OptionsRenderer = <T,>(
  options: DropdownItemType<T>[],
  handleSelectOption: (value: DropdownValueType<T>) => void,
  activeItem: DropdownValueType<T> | null,
  activeSubItem: string | null,
  setActiveSubItem: Dispatch<SetStateAction<string | null>>,
  hideIcons: boolean | undefined
) => ReactNode;

const optionsRenderer: OptionsRenderer = (
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
        })
      )}
    </div>
  </Infinite>
);

export { optionsRenderer };
