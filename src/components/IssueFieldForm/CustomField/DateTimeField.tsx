import { FC } from "react";
import { MappedFieldProps } from "../types";
import { getDateFromValue } from "../../../utils";
import { DateInput } from "@deskpro/app-sdk";

export const DateTimeField: FC<MappedFieldProps> = ({
  id,
  field,
  helpers,
  error,
}: MappedFieldProps) => (
  <DateInput
    id={id}
    enableTime
    onChange={(dates: any[]) => {
      helpers.setValue(dates[0].toISOString());
      helpers.setTouched(true);
    }}
    error={error}
    placeholder="Select date/time"
    value={field.value && getDateFromValue(field.value)}
  />
);
