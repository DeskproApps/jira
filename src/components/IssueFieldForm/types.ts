import { FieldHelperProps, FieldInputProps } from "formik/dist/types";
import { IssueMeta } from "../../types";

export interface MappedFieldProps {
    meta: IssueMeta;
    field: FieldInputProps<any>;
    helpers: FieldHelperProps<any>;
    id: string;
    error: boolean;
}