import { Checkbox } from "@deskpro/deskpro-ui";
import { Option } from "../../api/types/createMeta";
import { FieldMeta } from "../../api/types/types";

export const CheckboxesField = <Value extends Option>({
  meta,
  field,
  onChange,
}: {
  meta: FieldMeta<Value>;
  field: Value;
  onChange: (value: Value["id"]) => void;
}) => {
  return (meta.allowedValues ?? []).map((allowedValue, idx) => (
    <Checkbox
      key={idx}
      size={12}
      id={allowedValue.id}
      value={allowedValue.id}
      label={allowedValue.value}
      checked={field.id === allowedValue.id}
      onChange={() => onChange(allowedValue.id)}
    />
  ));
};
