import { Radio } from "@deskpro/deskpro-ui";
import { CreateMeta } from "../../api/types/createMeta";

export const RadioButtonsField = ({
  meta,
  field,
  onChange,
}: {
  meta: CreateMeta["projects"]["0"]["issuetypes"]["0"]["fields"]["0"];
  field: any;
  onChange: (value: any) => void;
}) => {
  const allowedValues = meta?.allowedValues ?? [];

  return allowedValues.map((allowedValue, idx: number) => (
    <Radio
      key={idx}
      label={allowedValue.value}
      value={allowedValue.id}
      checked={allowedValue.id === field}
      id={allowedValue.id}
      onChange={(e) => onChange(e.target.value)}
    />
  ));
};
