import { FC } from "react";
import { MappedFieldProps } from "../types";
import { getDateFromValue } from "../../../utils";
import { Label } from "@deskpro/deskpro-ui";
import { DateInput } from "@deskpro/app-sdk";

export const DateTimeField: FC<MappedFieldProps> = ({ id, meta, field, helpers, error }: MappedFieldProps) => (
  <Label htmlFor={id} label={meta.name} error={error}>
    <DateInput
      id={id}
      enableTime
      error={error}
      value={field.value && getDateFromValue(field.value)}
      onChange={(dates: Date[]) => {
        helpers.setValue(dates[0]);
        helpers.setTouched(true);
      }}
    />
  </Label>
);
