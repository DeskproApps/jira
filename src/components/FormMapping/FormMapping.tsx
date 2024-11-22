import { DropdownValueType } from "@deskpro/deskpro-ui";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { Input, Label, Stack, TextArea } from "@deskpro/deskpro-ui";
import { useMemo } from "react";
import { getVersionsByProjectId } from "../../api/api";
import { Option, Priority, Issuetype, CreateMeta } from "../../api/types/createMeta";
import { FieldMeta, AttachmentFile, Version } from "../../api/types/types";
import { FieldType, DateTime } from "../../types";
import { JiraIssueSchema } from "../../schema/schema";
import { AttachmentsField } from "../AttachmentsField/AttachmentsField";
import { CheckboxesMultiField } from "../Checkbox/CheckboxesMultiField";
import { DateField } from "../DateField/DateField";
import { DropdownMultiSelect } from "../DropdownMultiSelect/DropdownMultiSelect";
import { DropdownSelect } from "../DropdownSelect/DropdownSelect";
import { SubtaskDropdownWithSearch } from "../SubtaskDropdownWithSearch/SubtaskDropdownWithSearch";
import { RadioButtonsField } from "../Radio/RadioButtonsField";
import { FieldErrors, UseFormSetValue } from "react-hook-form";
import { IssueLink } from "../../api/types/fieldsValue";

type Props = {
  dropdownFields: {
    project: DropdownValueType<string>[];
    user: DropdownValueType<string>[];
    labels: DropdownValueType<string>[];
    issuetypes?: Issuetype[];
  };
  values: JiraIssueSchema;
  createMeta: CreateMeta;
  type: string;
  errors: FieldErrors<JiraIssueSchema>;
  setValue: UseFormSetValue<JiraIssueSchema>;
  usableFields: FieldMeta[];
};

export const FormMapping = ({
  dropdownFields,
  values,
  usableFields,
  createMeta,
  type,
  errors,
  setValue,
}: Props) => {
  const versionsByProjIdQuery = useQueryWithClient(
    ["versionsByProjId"],
    (client) => getVersionsByProjectId(client, values.project?.id),
    { enabled: !!values.project?.id },
  );

  const versionOptions = versionsByProjIdQuery.data?.map((ver) => ({
    key: ver.id,
    label: ver.name,
    value: ver.id,
    type: "value" as const,
  })) ?? [];

  const issuetypes = useMemo(() => {
    if (!values.project?.id) return [];
    return createMeta.projects.find((e) => e.id === values.project.id)
      ?.issuetypes;
  }, [values.project?.id, createMeta.projects]);

  const priorityFields = useMemo(() => {
    const priorityMeta = usableFields?.find((e) => e.key === "priority");

    if (!priorityMeta) return [];

    return (priorityMeta?.allowedValues as Priority[])?.map((e) => ({
      key: e.name,
      label: e.name,
      value: e.id,
      type: "value" as const,
    })) ?? [];
  }, [usableFields]);

  const fields = usableFields
    .filter((e) => e.key !== "issuetype" && e.key !== "project")
    ?.map((field) => {
      let content;

      switch (field.schema?.type) {
        case "select":
          content = (
            <DropdownSelect<Option["id"]>
              options={dropdownFields[field.key as keyof Omit<Props["dropdownFields"], "issuetypes">] || []}
              value={(values[field.key] as Option)?.id}
              error={Boolean(errors[field.key])}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "option":
          if (field.schema.custom === FieldType.RADIO_BUTTONS) {
            content = (
              <RadioButtonsField
                meta={field}
                field={(values[field.key] as Option)?.id}
                onChange={(value: Option["id"]) => setValue(`${field.key}.id`, value)}
              />
            );

            break;
          }
          content = (
            <DropdownSelect
              options={
                (field.allowedValues as Option[])?.map((e: Option) => ({
                  key: e.name || e.value,
                  label: e.name || e.value,
                  value: e.id,
                  type: "value" as const,
                })) ?? []
              }
              value={(values[field.key] as Option)?.id}
              error={Boolean(errors[field.key])}
              onChange={(value: Option["id"]) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "number":
          content = (
            <Input
              type="number"
              onChange={(e) => setValue(field.key, Number(e.target.value))}
              value={values[field.key] as number}
              error={Boolean(errors[field.key])}
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
              label={field.name}
              error={Boolean(errors[field.key])}
              id={field.key}
              value={new Date(values[field.key] as DateTime)}
              onChange={(value: Date[]) => setValue(field.key, value[0])}
            />
          );
          break;

        case "array":
          switch (field.schema?.items) {
            case "option":
              if (field.schema.custom === FieldType.CHECKBOXES) {
                content = (
                  <CheckboxesMultiField<Option>
                    meta={field as FieldMeta<Option>}
                    field={values[field.key] as Option[]}
                    onChange={(value) => setValue(`${field.key}`, value)}
                  />
                );

                break;
              }
              content = (
                <DropdownMultiSelect
                  options={(field.allowedValues as Option[])?.map((e) => ({
                    key: e.name || e.value,
                    label: e.name || e.value,
                    value: e,
                    type: "value" as const
                  })) ?? []}
                  values={values[field.key] as Option[]}
                  error={Boolean(errors[field.key])}
                  onChange={(value) => setValue(field.key, value)}
                  valueAccessor={(e) => (e as Option)?.id}
                />
              );
              break;

            case "string":
              if (field.schema.system === "labels" || field.schema.custom === FieldType.LABELS) {
                content = (
                  <DropdownMultiSelect
                    options={dropdownFields.labels as DropdownValueType<Option|Option["id"]>[]}
                    values={values[field.key] as Option[]}
                    error={Boolean(errors[field.key])}
                    onChange={(value) => setValue(field.key, value)}
                    valueAccessor={(e) => e}
                  />
                );
              }
              break;

            case "attachment":
              content = (
                <AttachmentsField
                  onFiles={(e) => setValue(field.key, e)}
                  existing={values[field.key] as AttachmentFile[]}
                />
              );
              break;

            case "version":
              content = (
                <DropdownMultiSelect
                  options={versionOptions}
                  values={values[field.key] as Option[]}
                  error={Boolean(errors[field.key])}
                  onChange={(value) => setValue(field.key, value)}
                  valueAccessor={(e) => e}
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
              options={versionOptions}
              value={(values[field.key] as Version)?.id}
              error={Boolean(errors[field.key])}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "user":
          content = (
            <DropdownSelect
              options={dropdownFields.user}
              value={(values[field.key] as Option)?.id}
              error={Boolean((errors[field.key]))}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "priority":
          content = (
            <DropdownSelect
              options={priorityFields}
              value={(values[field.key] as Priority)?.id}
              error={Boolean(errors[field.key])}
              onChange={(value) => setValue(`${field.key}.id`, value)}
            />
          );
          break;

        case "issuelink":
          content = (
            <SubtaskDropdownWithSearch
              projectId={values.project?.id}
              setValue={(value) => setValue(`${field.key}.id`, value)}
              id={field.key}
              placeholder="Select value"
              value={(values[field.key] as IssueLink)?.id}
            />
          );
          break;

        case "string":
          if (
            field.schema.system === "description"
            || field.schema.custom === FieldType.TEXT_PARAGRAPH
          ) {
            content = (
              <TextArea
                onChange={(e) => setValue(field.key, e.target.value)}
                value={values[field.key] as string}
                error={Boolean(errors[field.key])}
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
              value={values[field.key] as string}
              error={Boolean(errors[field.key])}
              id={field.key}
              variant="inline"
              placeholder="Add value"
              data-testid={`input=${field.key}`}
            />
          );

          break;
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
          <Label label={field.name} error={Boolean(errors[field.key])}>
            {content}
          </Label>
        )
      );
    });

  return (
    <Stack vertical style={{ width: "100%" }} gap={10}>
      <Label htmlFor="project" label="Project" error={Boolean(errors.project?.id)}>
        <DropdownSelect
          options={dropdownFields.project}
          disabled={type === "update"}
          value={values.project?.id}
          onChange={(value) => setValue("project.id", value)}
          error={Boolean(errors.project?.id)}
        />
      </Label>

      {values.project?.id && (
        <Label
          htmlFor={"issuetype"}
          label="Issue Type"
          error={Boolean(errors.issuetype?.id)}
        >
          <DropdownSelect
            options={
              issuetypes?.map((e) => ({
                key: e.name,
                label: e.name,
                type: "value" as const,
                value: e.id,
              })) ?? []
            }
            disabled={type === "update"}
            value={values.issuetype?.id}
            onChange={(value) => setValue("issuetype.id", value)}
            error={Boolean(errors.issuetype?.id)}
          />
        </Label>
      )}
      {values.project?.id && values.issuetype?.id && <>{fields}</>}
    </Stack>
  );
};
