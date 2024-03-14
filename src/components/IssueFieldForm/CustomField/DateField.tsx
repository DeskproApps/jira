import { FC } from "react";
import { MappedFieldProps } from "../types";
import { getDateFromValue } from "../../../utils";
import { DateInput } from "@deskpro/app-sdk";

export const DateField: FC<MappedFieldProps> = ({
  id,
  field,
  helpers,
  error,
}: MappedFieldProps) => (
  <DateInput
    id={id}
    error={error}
    value={field.value && getDateFromValue(field.value)}
    placeholder="Select date"
    onChange={(dates: any[]) => {
      helpers.setValue(dates[0].toISOString());
      helpers.setTouched(true);
    }}
  />
);
