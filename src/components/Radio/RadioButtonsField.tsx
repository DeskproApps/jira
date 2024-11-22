import { Radio } from "@deskpro/deskpro-ui";
import { Option } from "../../api/types/createMeta";
import { FieldMeta } from "../../api/types/types";

export const RadioButtonsField = ({
  meta,
  field,
  onChange,
}: {
  meta: FieldMeta;
  field: Option["id"];
  onChange: (value: Option["id"]) => void;
}) => {
  const allowedValues = meta?.allowedValues as Option[] ?? [];

  return (
    <>
      {allowedValues.map((allowedValue) => (
        <Radio
          key={allowedValue.id}
          label={allowedValue.value}
          value={allowedValue.id}
          checked={allowedValue.id === field}
          id={allowedValue.id}
          onChange={(e) => onChange(e.target.value)}
        />
      ))}
    </>
  );
};
