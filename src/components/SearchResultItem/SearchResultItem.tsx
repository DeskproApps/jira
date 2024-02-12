import { useCallback, MouseEventHandler } from "react";
import { P5, Stack } from "@deskpro/deskpro-ui";
import {
  Link,
  Title,
  Member,
  Property,
  LinkIcon,
  TwoProperties,
  HorizontalDivider,
} from "@deskpro/app-sdk";
import { FC, ReactElement } from "react";
import { IssueSearchItem } from "../../context/StoreProvider/types";
import { useAssociatedEntityCount } from "../../hooks";
import { JiraIcon } from "../common";
import { nbsp } from "../../constants";

export interface SearchResultItemProps {
  jiraDomain: string;
  item: IssueSearchItem;
  checkbox?: ReactElement;
  onSelect?: () => void;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({ jiraDomain, item, checkbox, onSelect }: SearchResultItemProps) => {
  const entityCount = useAssociatedEntityCount(item.key);
  const onClick: MouseEventHandler<HTMLAnchorElement> = useCallback((e) => {
    e.preventDefault();
    onSelect && onSelect();
  }, [onSelect]);

  return (
    <>
      <Stack align="start" gap={10}>
        {checkbox && checkbox}
        <div>
          <Title
            title={<Link onClick={onClick} href="#">{item.summary}</Link>}
            link={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}
            icon={<JiraIcon/>}
          />
          <TwoProperties
            leftLabel="Issue Key"
            leftText={(
              <P5>
                <span dangerouslySetInnerHTML={{__html: item.keyHtml ? item.keyHtml : item.key}}/>
                {nbsp}
                <LinkIcon href={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}/>
              </P5>
            )}
            rightLabel="Deskpro Tickets"
            rightText={entityCount}
          />
          <Property
            label="Project"
            text={(
              <P5>
                {item.projectName}{nbsp}
                <LinkIcon href={`https://${jiraDomain}.atlassian.net/browse/${item.projectKey}`} />
              </P5>
            )}
          />
          {item.epicKey && (
            <Property
              label="Epic"
              text={(
                <P5>
                  {item.epicName}
                  <LinkIcon href={`https://${jiraDomain}.atlassian.net/browse/${item.epicKey}`} />
                </P5>
              )}
            />
          )}
          <Property label="Status" text={item.status}/>
          <Property
            label="Reporter"
            text={(
              <Stack gap={6} align="center">
                <Member
                  name={item.reporterName}
                  avatarUrl={item.reporterAvatarUrl}
                />
                {item.reporterId && (
                  <LinkIcon href={`https://${jiraDomain}.atlassian.net/jira/people/${item.reporterId}`}/>
                )}
              </Stack>
            )}
          />
        </div>
      </Stack>
      <HorizontalDivider style={{marginTop: "8px", marginBottom: "8px"}}/>
    </>
  );
};
