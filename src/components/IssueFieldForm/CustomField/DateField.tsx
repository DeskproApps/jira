import { FC } from "react";
import { MappedFieldProps } from "../types";
import { getDateFromValue } from "../../../utils";
import { DatePickerInput, DatePicker, Label } from "@deskpro/app-sdk";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export const DateField: FC<MappedFieldProps> = ({ id, meta, field, helpers, error }: MappedFieldProps) => (
    <DatePicker
        options={{ position: "left" }}
        onChange={(dates: any[]) => {
            helpers.setValue(dates[0]);
            helpers.setTouched(true);
        }}
        value={field.value && getDateFromValue(field.value)}
        render={(_: any, ref: any) => (
            <Label
                htmlFor={id}
                label={meta.name}
                error={error}
                placeholder="Select date"
            >
                <DatePickerInput id={id} inputsize="small" variant="inline" rightIcon={faCalendarAlt} ref={ref} style={{ maxWidth: "244px" }} />
            </Label>
        )}
    />
);
