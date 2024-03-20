import { H1, P5, Stack } from "@deskpro/deskpro-ui";
import {
  HorizontalDivider,
  Property,
  useDeskproAppTheme,
  TwoProperties,
} from "@deskpro/app-sdk";
import { FC, ReactElement } from "react";
import { IssueSearchItem } from "../../context/StoreProvider/types/types";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import "./SearchResultItem.css";
import { useAssociatedEntityCount } from "../../hooks";

export interface SearchResultItemProps {
  jiraDomain: string;
  item: IssueSearchItem;
  checkbox?: ReactElement;
  onSelect?: () => void;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({
  jiraDomain,
  item,
  checkbox,
  onSelect,
}: SearchResultItemProps) => {
  const { theme } = useDeskproAppTheme();
  const entityCount = useAssociatedEntityCount(item.key);

  return (
    <>
      <Stack align="start" gap={10}>
        {checkbox && checkbox}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "start" }}>
            <H1
              onClick={() => onSelect && onSelect()}
              style={{
                color: theme.colors.cyan100,
                cursor: "pointer",
                marginRight: "1px",
              }}
            >
              {item.summary}
            </H1>
            <ExternalLink
              href={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}
              style={{ position: "relative", top: "-4px" }}
            />
          </div>
          <TwoProperties
              leftLabel="Issue Key"
              leftText={(
                <P5>
                  <span
                      dangerouslySetInnerHTML={{ __html: item.keyHtml ? item.keyHtml : item.key }}
                  />
                  <ExternalLink href={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}/>
                </P5>
              )}
              rightLabel="Deskpro Tickets"
              rightText={entityCount}
          />
          <Property
              label="Project"
              text={(
                  <P5>
                      {item.projectName}
                      <ExternalLink
                          href={`https://${jiraDomain}.atlassian.net/browse/${item.projectKey}`}
                      />
                  </P5>
              )}
          />
          {item.epicKey && (
            <Property
                label="Epic"
                text={(
                    <P5>
                        {item.epicName}
                        <ExternalLink
                            href={`https://${jiraDomain}.atlassian.net/browse/${item.epicKey}`}
                        />
                    </P5>
                )}
            />
          )}
          <Property label="Status" text={item.status}/>
          <Property
              label="Reporter"
              text={(
                  <P5 style={{position: "relative"}}>
                      {item.reporterAvatarUrl && (
                          <img
                              src={item.reporterAvatarUrl}
                              width={18}
                              height={18}
                              alt=""
                              className="user-avatar"
                          />
                      )}
                      <span className="user-name">{item.reporterName}</span>
                      {item.reporterId && (
                          <ExternalLink
                              href={`https://${jiraDomain}.atlassian.net/jira/people/${item.reporterId}`}
                          />
                      )}
                  </P5>
              )}
          />
        </div>
      </Stack>
        <HorizontalDivider style={{marginTop: "8px", marginBottom: "8px"}}/>
    </>
  );
};
