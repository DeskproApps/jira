import { FC } from "react";
import { MappedFieldProps } from "../types";
import { getDateFromValue } from "../../../utils";
import { DateTimePicker, Input, Label } from "@deskpro/app-sdk";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export const DateTimeField: FC<MappedFieldProps> = ({ id, meta, field, helpers, error }: MappedFieldProps) => (
    <DateTimePicker
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
                placeholder="Select date/time"
            >
                <Input id={id} inputsize="small" variant="inline" rightIcon={faCalendarAlt} ref={ref} style={{ maxWidth: "244px" }} />
            </Label>
        )}
    />
);
