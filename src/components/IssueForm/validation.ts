import * as Yup from "yup";

export const schema = Yup.object().shape({
  project: Yup.string().required(),
  issuetype: Yup.string().required(),
  summary: Yup.string().min(1).max(255).required(),
  description: Yup.string().min(1).max(100000).required(),
  reporter: Yup.string().required(),
});
