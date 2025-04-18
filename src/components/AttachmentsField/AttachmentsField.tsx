import React, { ChangeEvent, FC, useRef, useState } from "react";
import { AnyIcon, AttachmentTag, Button, Stack } from "@deskpro/deskpro-ui";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { omit } from "lodash-es";
import { AttachmentFile } from "../../api/types/types";

interface AttachmentsFieldProps {
  onFiles?: (files: AttachmentFile[]) => void;
  existing?: AttachmentFile[];
}

export const AttachmentsField: FC<AttachmentsFieldProps> = ({
  onFiles,
  existing,
}: AttachmentsFieldProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [fieldIdx, setFieldIdx] = useState<number>((existing ?? []).length);
  const [fields, setFields] = useState<string[]>([
    "file[0]",
    ...(existing ?? []).map((_, idx: number) => `file[${idx + 1}]`),
  ]);
  const [files, setFiles] = useState<Record<string, AttachmentFile>>(
    (existing ?? []).reduce(
      (all, a, idx: number) => ({
        ...all,
        [`file[${idx}]`]: a,
      }),
      {},
    ),
  );

  const upload = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const file = e.target.files[0];

    const newFiles = {
      ...files,
      [name]: {
        file,
        name: file.name,
        size: file.size,
      } as AttachmentFile,
    };

    setFiles(newFiles);

    setFieldIdx(fieldIdx + 1);
    setFields([...fields, `file[${fieldIdx + 1}]`]);

    onFiles && onFiles(Object.values(newFiles));
  };

  const add = () => {
    fileRef.current && fileRef.current.click();
  };

  const remove = (name: string) => {
    if (files[name].id) {
      files[name].delete = true;
      setFiles(files);
      onFiles && onFiles(Object.values(files));
    } else {
      const remaining = omit(files, [name]);
      setFiles(remaining);
      onFiles && onFiles(Object.values(remaining));
    }
  };

  return (
    <>
      {fields.map((name: string, idx: number) => (
        <input
          key={idx}
          name={name}
          type="file"
          onChange={(e) => upload(e, name)}
          ref={idx === fieldIdx ? fileRef : null}
          style={{ display: "none" }}
        />
      ))}
      <Stack gap={3} vertical>
        {Object.keys(files)
          .filter((name) => !files[name]?.delete)
          .map((name, idx: number) => (
            <AttachmentTag
              key={idx}
              filename={files[name].name}
              fileSize={files[name].size}
              icon={faFile as AnyIcon}
              maxWidth="244px"
              withClose
              onClose={() => remove(name)}
            />
          ))}
        <Button
          text={"Add"}
          icon={faPlus as AnyIcon}
          minimal
          style={{ marginLeft: "6px" }}
          onClick={add}
        />
      </Stack>
    </>
  );
};
