import { DateInput } from "@deskpro/app-sdk";
import { FC } from "react";
import { DateTimePickerProps } from "react-flatpickr";
import "./DateField.css";
import "flatpickr/dist/themes/light.css";
export type MappedFieldProps = DateTimePickerProps & {
  id?: string;
  label: string;
  error?: boolean;
  value: string;
  onChange: (date: Date[]) => void;
};

export const DateField: FC<MappedFieldProps> = ({
  error,
  value,
  onChange,
}: MappedFieldProps) => {
  return (
    <DateInput
      value={value}
      id="date-input"
      placeholder="DD/MM/YYYY"
      error={!!error}
      onChange={onChange}
    />
  );
};
