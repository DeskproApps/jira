import { TSpan, Stack, Toggle, PP3Medium } from "@deskpro/deskpro-ui";
import { FieldsMap } from "./FieldsMap";
import type { FC } from "react";
import type { Layout } from "../../../../types";
import type { FieldMeta } from "../../../../api/types/types";

type Props = {
  fields: FieldMeta[];
  selectedSettings: Partial<Layout>;
  onUpdateEnableMapping: () => void;
  onUpdateMapping: (value: Array<FieldMeta["id"]>, keyName: keyof Layout) => void;
};

const Fields: FC<Props> = ({
  fields,
  selectedSettings,
  onUpdateMapping,
  onUpdateEnableMapping,
}) => {
  const isShow = Boolean(selectedSettings.enableMapping);

  return (
    <>
      <Stack align="left" gap={8} style={{ marginBottom: "10px" }}>
        <Toggle
          checked={Boolean(selectedSettings.enableMapping)}
          onChange={onUpdateEnableMapping}
        />
        <div>
          <PP3Medium>Custom field mapping</PP3Medium>
          <TSpan type="p_p4_paragraph" themeColor="grey40">
            Select which fields appear on the app's pages for creating and viewing issues, and the app's homepage
          </TSpan>
        </div>
      </Stack>

      {isShow && (
        <FieldsMap
          fields={fields}
          onUpdateMapping={onUpdateMapping}
          selectedSettings={selectedSettings}
        />
      )}
    </>
  );
};

export { Fields };
