import { Checkbox } from "@deskpro/deskpro-ui";
import { Option } from "../../api/types/createMeta";
import { FieldMeta } from "../../api/types/types";

export const CheckboxesMultiField = <Value extends Option>({
  meta,
  field,
  onChange,
}: {
  meta: FieldMeta<Value>;
  field: Value[];
  onChange: (value: Value[]) => void;
}) => {
  const mappedField = (field ?? []).map((e: Option) => e.id);

  return (
    <>
      {(meta.allowedValues ?? []).map((allowedValue, idx) => (
        <Checkbox
          key={idx}
          label={allowedValue.value}
          checked={mappedField?.includes(allowedValue.id)}
          value={allowedValue.id}
          onChange={() => {
            const value = field ?? [];
            const checked = mappedField.includes(allowedValue.id)
            const newValues: Value[] = value.slice();

            if (checked) {
              newValues.splice(
                newValues.findIndex(
                  (e: { id: string }) => e.id === allowedValue.id,
                ),
                1,
              );
            } else if (!checked) {
              newValues.push({ id: allowedValue.id } as Value);
            }
            onChange(newValues);
          }}
          id={allowedValue.id}
          size={12}
        />
      ))}
    </>
  );
};
