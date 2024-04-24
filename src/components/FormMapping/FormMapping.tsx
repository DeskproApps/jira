import { useQueryWithClient } from "@deskpro/app-sdk";
import { Input, Label, Stack, TextArea } from "@deskpro/deskpro-ui";
import { useMemo } from "react";
import { getVersionsByProjectId } from "../../api/api";
import { Assignee, Attachment, CreateMeta } from "../../api/types/createMeta";
import { IssueMeta } from "../../types";
import { AttachmentsField } from "../AttachmentsField/AttachmentsField";
import { DateField } from "../DateField/DateField";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { SubtaskDropdownWithSearch } from "../SubtaskDropdownWithSearch/SubtaskDropdownWithSearch";

export const FormMapping = ({
  dropdownFields,
  values,
  usableFields,
  createMeta,
  type,
  errors,
  setValue,
}: {
  dropdownFields: any;
  values: any;
  createMeta: CreateMeta;
  type: string;
  errors: any;
  setValue: any;
  usableFields: (Assignee | Attachment)[];
}) => {
  const versionsByProjIdQuery = useQueryWithClient(
    ["versionsByProjId"],
    (client) => getVersionsByProjectId(client, values.project?.id),
    {
      enabled: !!values.project?.id,
    },
  );
  const issuetypes = useMemo(() => {
    if (!values.project?.id) return [];
    return createMeta.projects.find((e) => e.id === values.project.id)
      ?.issuetypes;
  }, [values.project?.id, createMeta.projects]);

  const priorityFields = useMemo(() => {
    if (!usableFields || usableFields.length === 0) return [];

    return (
      usableFields
        ?.find((e) => e.key === "priority")
        ?.allowedValues?.map((e) => ({
          key: e.name,
          label: e.name,
          value: e.id,
          type: "value" as const,
        })) ?? []
    );
  }, [usableFields]);

  const fields = usableFields
    .filter((e) => e.key !== "issuetype" && e.key !== "project")
    ?.map((field) => {
      let content;
      switch (field.schema?.type) {
        case "select":
          content = (
            <DropdownSelect
              data={dropdownFields[field.key]}
              value={values[field.key]?.id}
              error={errors[field.key]?.id}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "option":
          content = (
            <DropdownSelect
              data={
                field.allowedValues?.map((e) => ({
                  key: e.name || e.value,
                  label: e.name || e.value,
                  value: e.id,
                  type: "value" as const,
                })) ?? []
              }
              value={values[field.key]?.id}
              error={errors[field.key]?.id}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "number":
          content = (
            <Input
              type="number"
              onChange={(e) => setValue(field.key, e.target.value)}
              value={values[field.key]}
              error={errors[field.key]}
              id={field.key}
            />
          );
          break;

        case "comments-page":
          break;

        case "date":
        case "datetime":
          content = (
            <DateField
              meta={{ name: field.name } as unknown as IssueMeta}
              error={errors[field.key]}
              id={field.key}
              value={new Date(values[field.key])}
              onChange={(value: Date[]) => setValue(field.key, value[0])}
            />
          );
          break;

        case "array":
          switch (field.schema?.items) {
            case "option":
              content = (
                <DropdownSelect
                  data={
                    field.allowedValues?.map((e) => ({
                      key: e.name || e.value,
                      label: e.name || e.value,
                      value: e,
                      type: "value" as const,
                    })) ?? []
                  }
                  multiple
                  value={values[field.key]}
                  valueAccessor={(e) => e.id}
                  error={errors[field.key]}
                  onChange={(value) => setValue(field.key, value)}
                />
              );
              break;

            case "string":
              if (field.key === "labels") {
                content = (
                  <DropdownSelect
                    data={dropdownFields.labels}
                    multiple
                    value={values[field.key]}
                    error={errors[field.key]}
                    onChange={(value) => setValue(field.key, value)}
                  />
                );
              }
              break;

            case "attachment":
              content = (
                <AttachmentsField
                  onFiles={(e) => setValue(field.key, e)}
                  existing={values[field.key]}
                />
              );
              break;

            case "version":
              content = (
                <DropdownSelect
                  data={
                    versionsByProjIdQuery.data?.map(
                      (e: { id: string; name: string }) => ({
                        key: e.id,
                        label: e.name,
                        value: e.id,
                        type: "value" as const,
                      }),
                    ) ?? []
                  }
                  multiple
                  value={values[field.key]}
                  error={errors[field.key]}
                  onChange={(value) => setValue(field.key, value)}
                />
              );
              break;
            default:
              break;
          }
          break;

        case "version":
          content = (
            <DropdownSelect
              data={dropdownFields.versions}
              value={values[field.key]?.id}
              error={errors[field.key]?.id}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "user":
          content = (
            <DropdownSelect
              data={dropdownFields.user}
              value={values[field.key]?.id}
              error={errors[field.key]?.id}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "priority":
          content = (
            <DropdownSelect
              data={priorityFields}
              value={values[field.key]?.id}
              error={errors[field.key]?.id}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "issuelink":
          content = (
            <SubtaskDropdownWithSearch
              projectId={values.project?.id}
              setValue={(value: string) => setValue(`${field.key}.id`, value)}
              id={field.key}
              placeholder="Select value"
            />
          );
          break;

        case "string":
          if (field.schema.system === "description") {
            content = (
              <TextArea
                onChange={(e) => setValue(field.key, e.target.value)}
                value={values[field.key]}
                error={errors[field.key]}
                id={field.key}
                variant="inline"
                placeholder="Add value"
                data-testid={`input=${field.key}`}
                style={{ minHeight: "100px" }}
              />
            );
            break;
          }
          content = (
            <Input
              onChange={(e) => setValue(field.key, e.target.value)}
              value={values[field.key]}
              error={errors[field.key]}
              id={field.key}
              variant="inline"
              placeholder="Add value"
              data-testid={`input=${field.key}`}
            />
          );
        // eslint-disable-next-line no-fallthrough
        default:
        // content = (
        //   <Input
        //     onChange={(e) => setValue(field.key, e.target.value)}
        //     value={values[field.key]}
        //     error={errors[field.key]}
        //     id={field.key}
        //     variant="inline"
        //     placeholder="Add value"
        //     data-testid={`input=${field.key}`}
        //   />
        // );
      }

      return (
        content && (
          <Label label={field.name} error={errors[field.key]}>
            {content}
          </Label>
        )
      );
    });

  return (
    <Stack vertical style={{ width: "100%" }} gap={10}>
      <Label htmlFor="project" label="Project" error={errors.project?.id}>
        <DropdownSelect
          data={dropdownFields.project}
          disabled={type === "update"}
          value={values.project?.id}
          onChange={(value) => setValue("project.id", value)}
          error={errors.project?.id}
        />
      </Label>

      {values.project?.id && (
        <Label
          htmlFor={"issuetype"}
          label="Issue Type"
          error={errors.issuetype?.id}
        >
          <DropdownSelect
            data={
              issuetypes?.map((e) => ({
                key: e.name,
                value: e.id,
              })) ?? []
            }
            disabled={type === "update"}
            value={values.issuetype?.id}
            onChange={(value) => setValue("issuetype.id", value)}
            error={errors.issuetype?.id}
          />
        </Label>
      )}
      {values.project?.id && values.issuetype?.id && <>{fields}</>}
    </Stack>
  );
};
