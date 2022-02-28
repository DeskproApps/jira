import React, {ChangeEvent, FC, useRef, useState} from "react";
import {AttachmentTag, Button, Stack} from "@deskpro/app-sdk";
import {faFile} from "@fortawesome/free-regular-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import {omit} from "lodash";

interface AttachmentsFieldProps {

}

export const AttachmentsField: FC<AttachmentsFieldProps> = () => {
    const fileRef = useRef<HTMLInputElement>(null);

    const [fieldIdx, setFieldIdx] = useState<number>(0);
    const [fields, setFields] = useState<string[]>(["file[0]"]);
    const [files, setFiles] = useState<Record<string, File>>({});

    const upload = (e: ChangeEvent<HTMLInputElement>, name: string) => {
        if (!e.target.files) {
            return;
        }

        setFiles({
            ...files,
            [name]: e.target.files[0],
        });

        setFieldIdx(fieldIdx + 1);
        setFields([...fields, `file[${fieldIdx + 1}]`]);
    };

    const add = () => fileRef.current && fileRef.current.click();

    const remove = (name: string) => setFiles(omit(files, [name]));

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
                {Object.keys(files).map((name, idx: number) => (
                    <AttachmentTag
                        key={idx}
                        filename={files[name].name}
                        fileSize={files[name].size}
                        icon={faFile}
                        maxWidth="244px"
                        withClose
                        onClose={() => remove(name)}
                    />
                ))}
                <Button text={"Add"} icon={faPlus} minimal style={{ marginLeft: "6px" }} onClick={add} />
            </Stack>
        </>
    );
};
