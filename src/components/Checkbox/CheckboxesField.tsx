import { Checkbox } from "@deskpro/deskpro-ui";
import { CreateMeta } from "../../api/types/createMeta";

export const CheckboxesField = ({
  meta,
  field,
  onChange,
  multiple,
  valueAccessor,
}: {
  meta: CreateMeta["projects"]["0"]["issuetypes"]["0"]["fields"]["0"];
  field: any;
  onChange: (value: any) => void;
  multiple: boolean;
  valueAccessor: (e: any) => any;
}) => {
  const mappedField = multiple
    ? (field ?? []).map((e: any) => valueAccessor(e))
    : valueAccessor(field);

  return (meta.allowedValues ?? []).map((allowedValue, idx: number) => (
    <Checkbox
      key={idx}
      label={allowedValue.value}
      checked={
        multiple
          ? mappedField?.includes(allowedValue.id)
          : mappedField === allowedValue.id
      }
      value={allowedValue.id}
      onChange={() => {
        if (!multiple) {
          onChange(allowedValue.id);
          return;
        }
        const value = field ?? [];
        const checked = multiple
          ? mappedField.includes(allowedValue.id)
          : mappedField === allowedValue.id;
        const newValues = value.slice();

        if (checked) {
          newValues.splice(
            newValues.findIndex(
              (e: { id: string }) => e.id === allowedValue.id,
            ),
            1,
          );
        } else if (!checked) {
          newValues.push({ id: allowedValue.id });
        }
        onChange(newValues);
      }}
      id={allowedValue.id}
      size={12}
    />
  ));
};
