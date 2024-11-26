import { DateInput } from "@deskpro/app-sdk";
import { FC } from "react";
import "./DateField.css";
import "flatpickr/dist/themes/light.css";

type MappedFieldProps = {
  id?: string;
  label: string;
  error?: boolean;
  value: Date;
  enableTime?: boolean;
  onChange: (date: Date[]) => void;
};

export const DateField: FC<MappedFieldProps> = ({
  error,
  value,
  onChange,
  enableTime,
}: MappedFieldProps) => {
  return (
    <DateInput
      value={value}
      id="date-input"
      placeholder="DD/MM/YYYY"
      error={Boolean(error)}
      onChange={onChange}
      enableTime={enableTime}
    />
  );
};
