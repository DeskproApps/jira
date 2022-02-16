import * as Yup from "yup";

export const schema = Yup.object().shape({
    projectId: Yup.string().required(),
    issueTypeId: Yup.string().required(),
    summary: Yup.string().min(1).max(255).required(),
    description: Yup.string().min(1).max(100000).required(),
    reporterUserId: Yup.string().required(),
});
