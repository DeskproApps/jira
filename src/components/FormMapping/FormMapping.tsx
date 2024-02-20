import { FormikField, Input, Label, Stack } from "@deskpro/deskpro-ui";
import { useMemo } from "react";
import { CreateMeta } from "../../context/StoreProvider/types/createMeta";
import { IssueMeta } from "../../types";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { DateField } from "../IssueFieldForm/CustomField/DateField";
import { DateTimeField } from "../IssueFieldForm/CustomField/DateTimeField";
import { DropdownMultiSelect } from "../DropdownMultiSelect/DropdownMultiSelect";
import { SubtaskDropdownWithSearch } from "../SubtaskDropdownWithSearch/SubtaskDropdownWithSearch";
import { AttachmentsField } from "../AttachmentsField/AttachmentsField";
import { AttachmentFile } from "../../context/StoreProvider/types/types";
import { getVersionsByProjectId } from "../../context/StoreProvider/api";
import { useQueryWithClient } from "@deskpro/app-sdk";

export const FormMapping = ({
  dropdownFields,
  values,
  mappedFields,
  createMeta,
  type,
}: {
  dropdownFields: any;
  values: any;
  mappedFields: string[];
  createMeta: CreateMeta;
  type: string;
}) => {
  const versionsByProjIdQuery = useQueryWithClient(
    ["versionsByProjId"],
    (client) => getVersionsByProjectId(client, values.project!),
    {
      enabled: !!values.project,
    }
  );
  const issuetypes = useMemo(() => {
    if (!values.project) return [];

    return createMeta.projects.find((e) => e.id === values.project)?.issuetypes;
  }, [values.project, createMeta.projects]);

  const usableFields = useMemo(() => {
    if (!values.issuetype || issuetypes?.length === 0) return [];

    const fieldsObj = issuetypes?.find(
      (e) => e.id === values.issuetype
    )?.fields;

    if (!fieldsObj) return [];

    return Object.keys(fieldsObj)
      .filter(
        (e) =>
          mappedFields.includes(e) ||
          e === "summary" ||
          e === "description" ||
          e === "reporter"
      )
      .map((fieldObjKey) => ({
        ...(fieldsObj[fieldObjKey as keyof typeof fieldsObj] ?? {}),
      }))
      .filter((field) => {
        return (
          (field.key !== "project" &&
            field.key !== "issuetype" &&
            field.name !== "Rank" &&
            field.name !== "Parent" && //fix
            !field.schema.custom?.includes("integration-plugin")) ||
          field.required
        );
      });
  }, [values.issuetype, issuetypes, mappedFields]);

  const priorityFields = useMemo(() => {
    if (!usableFields || usableFields.length === 0) return [];

    return (
      usableFields
        ?.find((e) => e.key === "priority")
        ?.allowedValues?.map((e) => ({
          key: e.id,
          label: e.name,
          value: e.id,
          type: "value" as const,
        })) ?? []
    );
  }, [usableFields]);

  const fields = usableFields?.map((field) => {
    switch (field.schema?.type) {
      case "select":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <DropdownSelect
                  options={dropdownFields[field.key]}
                  value={formikField.value}
                  helpers={helpers}
                />
              </Label>
            )}
          </FormikField>
        );

      case "option":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <DropdownSelect
                  options={
                    field.allowedValues?.map((e) => ({
                      key: e.id,
                      label: e.name || e.value,
                      value: e.id,
                      type: "value" as const,
                    })) ?? []
                  }
                  value={formikField.value}
                  helpers={helpers}
                />
              </Label>
            )}
          </FormikField>
        );

      case "number":
        return (
          <FormikField<string> name={field.key}>
            {([formikField], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <Input
                  type="number"
                  key={id}
                  value={formikField.value}
                  error={error}
                  id={id}
                />
              </Label>
            )}
          </FormikField>
        );

      case "date":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <DateField
                helpers={helpers}
                meta={{ name: field.name } as unknown as IssueMeta}
                key={id}
                field={formikField}
                error={error}
                id={id}
              />
            )}
          </FormikField>
        );

      case "datetime":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <DateTimeField
                helpers={helpers}
                meta={{ name: field.name } as unknown as IssueMeta}
                key={id}
                field={formikField}
                error={error}
                id={id}
              />
            )}
          </FormikField>
        );

      case "array":
        switch (field.schema?.items) {
          case "option":
            return (
              <FormikField<string> name={field.key}>
                {([formikField, , helpers], { id, error }) => (
                  <Label htmlFor={id} label={field.name} error={error}>
                    <DropdownMultiSelect
                      options={
                        field.allowedValues?.map((e) => ({
                          key: e.id,
                          label: e.name || e.value,
                          value: e.id,
                          type: "value" as const,
                        })) ?? []
                      }
                      key={id}
                      values={formikField.value as unknown as string[]}
                      id={id}
                      helpers={helpers}
                    />
                  </Label>
                )}
              </FormikField>
            );

          case "string":
            if (field.key === "labels") {
              return (
                <FormikField<string[]> name="labels">
                  {([field, , helpers], { id, error }) => (
                    <Label htmlFor={id} label="Labels" error={error}>
                      <DropdownMultiSelect
                        helpers={helpers}
                        options={dropdownFields.labels}
                        id={id}
                        placeholder="Select values"
                        values={field.value}
                      />
                    </Label>
                  )}
                </FormikField>
              );
            }
            break;

          case "attachment":
            return (
              <Label label="Attachments">
                <FormikField<AttachmentFile[]> name="attachments">
                  {([field, , helpers]) => (
                    <AttachmentsField
                      onFiles={helpers.setValue}
                      existing={field.value}
                    />
                  )}
                </FormikField>
              </Label>
            );

          case "version":
            return (
              <FormikField<string> name={field.key}>
                {([formikField, , helpers], { id, error }) => (
                  <Label htmlFor={id} label={field.name} error={error}>
                    <DropdownMultiSelect
                      options={
                        versionsByProjIdQuery.data?.map(
                          (e: { id: string; name: string }) => ({
                            key: e.id,
                            label: e.name,
                            value: e.id,
                            type: "value" as const,
                          })
                        ) ?? []
                      }
                      key={id}
                      values={(formikField.value as unknown as string[]) ?? []}
                      id={id}
                      helpers={helpers}
                    />
                  </Label>
                )}
              </FormikField>
            );

          default:
            break;
        }
        break;

      case "version":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <DropdownSelect
                  options={dropdownFields.version}
                  key={id}
                  value={formikField.value}
                  id={id}
                  helpers={helpers}
                />
              </Label>
            )}
          </FormikField>
        );

      case "user":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <DropdownSelect
                  options={dropdownFields.user}
                  key={id}
                  value={formikField.value}
                  id={id}
                  helpers={helpers}
                />
              </Label>
            )}
          </FormikField>
        );

      case "priority":
        return (
          <FormikField<string> name={field.key}>
            {([formikField, , helpers], { id, error }) => (
              <Label htmlFor={id} label="Priority" error={error}>
                <DropdownSelect
                  options={priorityFields}
                  key={id}
                  value={formikField.value}
                  id={id}
                  helpers={helpers}
                />
              </Label>
            )}
          </FormikField>
        );

      case "issuelink":
        return (
          <FormikField<string> name="parent">
            {([field, , helpers], { id, error }) => (
              <Label htmlFor={id} label="Parent" error={error}>
                <SubtaskDropdownWithSearch
                  projectId={values.project}
                  helpers={helpers}
                  id={id}
                  placeholder="Select value"
                  value={field.value}
                />
              </Label>
            )}
          </FormikField>
        );

      case "string":
      default:
        return (
          <FormikField<string> name={field.key}>
            {([formikField], { id, error }) => (
              <Label htmlFor={id} label={field.name} error={error}>
                <Input
                  id={id}
                  {...formikField}
                  variant="inline"
                  placeholder="Add value"
                />
              </Label>
            )}
          </FormikField>
        );
    }
  });

  return (
    <Stack vertical style={{ width: "100%" }} gap={10}>
      <FormikField<string> name="project">
        {([formikField, , helpers], { id, error }) => (
          <Label htmlFor={id} label="Project" error={error}>
            <DropdownSelect
              options={dropdownFields.project}
              disabled={type === "update"}
              value={formikField.value}
              placeholder="Select value"
              id={id}
              helpers={helpers}
            />
          </Label>
        )}
      </FormikField>
      {values.project && (
        <FormikField<string> name="issuetype">
          {([formikField, , helpers], { id, error }) => (
            <Label htmlFor={id} label="Issue Type" error={error}>
              <DropdownSelect
                options={
                  issuetypes?.map((e) => ({
                    key: e.id,
                    label: e.name,
                    value: e.id,
                    type: "value" as const,
                  })) ?? []
                }
                disabled={type === "update"}
                value={formikField.value}
                placeholder="Select value"
                id={id}
                helpers={helpers}
              />
            </Label>
          )}
        </FormikField>
      )}
      {values.project && values.issuetype && <>{fields}</>}
    </Stack>
  );
};
