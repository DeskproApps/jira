import { H1, P5, Stack } from "@deskpro/deskpro-ui";
import {
  HorizontalDivider,
  Property,
  useDeskproAppTheme,
    TwoProperties,
} from "@deskpro/app-sdk";
import { FC, Fragment, ReactElement } from "react";
import { Field, IssueItem } from "../../context/StoreProvider/types/types";
import { useAssociatedEntityCount } from "../../hooks";
import { ExternalLink } from "../ExternalLink/ExternalLink";
import "./LinkedIssueResultItem.css";
import { FieldMapping } from "../FieldMapping/FieldMapping";

export interface LinkedIssueResultItemProps {
  jiraDomain: string;
  item: IssueItem;
  checkbox?: ReactElement;
  onView?: () => void;
  hasMappedFields?: boolean;
  usableFields: Field[];
}

export const LinkedIssueResultItem: FC<LinkedIssueResultItemProps> = ({
  jiraDomain,
  item,
  checkbox,
  onView,
  hasMappedFields,
  usableFields,
}: LinkedIssueResultItemProps) => {
  const { theme } = useDeskproAppTheme();
  const entityCount = useAssociatedEntityCount(item.key);

  return (
    <Fragment>
      <Stack align="start" gap={10} style={{ width: "100%" }}>
        {checkbox && checkbox}
        <div style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "start" }}>
            <H1
              onClick={() => onView && onView()}
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
          {!hasMappedFields && (
            <>
              <TwoProperties
                  leftLabel="Issue Key"
                  leftText={(
                      <P5>
                        <span>{item.key}</span>
                        <ExternalLink
                            href={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}
                        />
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
                      <P5 style={{ position: "relative" }}>
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
            </>
          )}
          {hasMappedFields && (
              <FieldMapping issue={item} usableFields={usableFields}/>
          )}
        </div>
      </Stack>
      {<HorizontalDivider style={{marginTop: "8px", marginBottom: "8px", width: "100%" }}/>}
    </Fragment>
  );
};
