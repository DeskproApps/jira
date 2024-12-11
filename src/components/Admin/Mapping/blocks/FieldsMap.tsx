import { H1, P5, Checkbox, PP3Medium } from "@deskpro/deskpro-ui";
import { Table } from "../../../common";
import type { FC } from "react";
import type { Layout } from "../../../../types";
import type { FieldMeta } from "../../../../api/types/types";

type Props = {
  fields: FieldMeta[];
  selectedSettings: Partial<Layout>;
  onChange: (e: string, type: keyof Layout) => void;
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
          .filter((e) => e.schema && e.schema.type !== "any")
          .map((f) => (
            <Table.Row key={f.id}>
              <Table.Cell><P5>{f.name}</P5></Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={selectedSettings.detailView?.includes(f.id as string)}
                  onClick={() => onChange(f.id as string, "detailView")}
                />
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={selectedSettings.listView?.includes(f.id as string)}
                  onClick={() => onChange(f.id as string, "listView")}
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
