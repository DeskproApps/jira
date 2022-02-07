import * as Yup from "yup";

export const schema = Yup.object().shape({
    name: Yup.string().min(1).max(512).required(),
    description: Yup.string().min(1).max(100000).required(),
    // ...
});
