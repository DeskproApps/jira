import { useState } from "react";
import { TSpan, Stack, Toggle, PP3Medium } from "@deskpro/deskpro-ui";
import { FieldsMap } from "./FieldsMap";
import type { FC } from "react";
import type { Layout } from "../../../../types";
import type { FieldMeta } from "../../../../api/types/types";

type Props = {
  fields: FieldMeta[];
  selectedSettings: Partial<Layout>;
  onChange: (fieldId: FieldMeta["id"], type: keyof Layout) => void;
};

const Fields: FC<Props> = (props) => {
  const [isShow, setIsShow] = useState<boolean>(false);

  return (
    <>
      <Stack align="center" gap={8} style={{ marginBottom: "10px" }}>
          <Toggle
            checked={isShow}
            onChange={() => setIsShow(!isShow)}
          />
        <div>
          <PP3Medium>Custom field mapping</PP3Medium>
          <TSpan type="p_p4_paragraph" themeColor="grey40">
            Select which fields appear on the app's pages for creating and viewing issues, and the app's homepage
          </TSpan>
        </div>
      </Stack>

      {isShow && <FieldsMap {...props} />}
    </>
  );
};

export { Fields };
