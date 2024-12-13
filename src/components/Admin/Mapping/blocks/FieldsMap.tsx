import { H1, P5, Checkbox, PP3Medium } from "@deskpro/deskpro-ui";
import { Table } from "../../../common";
import type { FC } from "react";
import type { Layout } from "../../../../types";
import type { FieldMeta } from "../../../../api/types/types";

type Props = {
  fields: FieldMeta[];
  selectedSettings: Partial<Layout>;
  onChange: (fieldId: FieldMeta["id"], type: keyof Layout) => void;
};

const FieldsMap: FC<Props> = ({ fields, onChange, selectedSettings }) => {
  if (!fields.length) {
    return (
      <PP3Medium>No fields found</PP3Medium>
    )
  }

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell><H1>Fields</H1></Table.Cell>
          <Table.Cell><H1>Create &amp; Detail View</H1></Table.Cell>
          <Table.Cell><H1>List View</H1></Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {fields
          .filter((field) => field.schema && field.schema.type !== "any")
          .map((field: FieldMeta) => (
            <Table.Row key={field.id}>
              <Table.Cell><P5>{field.name}</P5></Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={selectedSettings.detailView?.includes(`${field.id}`)}
                  onClick={() => onChange(field.id, "detailView")}
                />
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={selectedSettings.listView?.includes(`${field.id}`)}
                  onClick={() => onChange(field.id, "listView")}
                />
              </Table.Cell>
            </Table.Row>
          ))
        }
      </Table.Body>
    </Table>
  );
};

export { FieldsMap };
