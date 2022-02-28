import React, {ChangeEvent, FC, useRef, useState} from "react";
import {AttachmentTag, Button, Stack} from "@deskpro/app-sdk";
import {faFile} from "@fortawesome/free-regular-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

interface AttachmentsFieldProps {

}

export const AttachmentsField: FC<AttachmentsFieldProps> = () => {
    const fileRef = useRef<HTMLInputElement>(null);

    const [fieldIdx, setFieldIdx] = useState<number>(0);
    const [fields, setFields] = useState<string[]>(["file[0]"]);

    const upload = (e: ChangeEvent<HTMLInputElement>, name: string) => {
        console.log(e, name);

        // ...

        setFieldIdx(fieldIdx + 1);
        setFields([...fields, `file[${fieldIdx + 1}]`]);
    };

    const add = () => {
        if (!fileRef.current) {
            return;
        }

        fileRef.current.click();
    };

    return (
        <>
            {fields.map((name: string, idx: number) => (
                <input
                    name={name}
                    type="file"
                    onChange={(e) => upload(e, name)}
                    ref={idx === fieldIdx ? fileRef : null}
                    // style={{ display: "none" }}
                />
            ))}
            <Stack gap={3} vertical>
                <AttachmentTag
                    filename={"foo.jpeg"}
                    fileSize={123}
                    icon={faFile}
                    maxWidth="244px"
                    withClose
                    onClose={() => {}}
                />
                <Button text={"Add"} icon={faPlus} minimal style={{ marginLeft: "6px" }} onClick={add} />
            </Stack>
        </>
    );
};
