import type { FC } from "react";
import type { MappedViewProps } from "../types";
import { Stack } from "@deskpro/deskpro-ui";
import { LinkIcon, Member, useDeskproLatestAppContext } from "@deskpro/app-sdk";
import { NoValue } from "../NoValue";

export const UserPickerField: FC<MappedViewProps> = ({ value }: MappedViewProps) => {
    const { context } = useDeskproLatestAppContext();
    const domain = context?.settings.domain as string;

    if (!value) {
        return (<NoValue />);
    }

    return (
      <Stack gap={6} align="center">
        <Member
          name={value.displayName}
          avatarUrl={value.avatarUrls["24x24"]}
        />
        <LinkIcon href={`https://${domain}.atlassian.net/jira/people/${value.accountId}`}/>
      </Stack>
    );
};
