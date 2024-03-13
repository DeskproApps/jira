import {
  H1,
  HorizontalDivider,
  Property,
  Stack,
  useDeskproAppTheme,
  VerticalDivider,
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
      <Stack align="start" gap={10}>
        {checkbox && checkbox}
        <Stack gap={10} vertical>
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
              <Stack align="stretch">
                <Property title="Issue Key" width="108px">
                  <span>{item.key}</span>
                  <ExternalLink
                    href={`https://${jiraDomain}.atlassian.net/browse/${item.key}`}
                  />
                </Property>
                <VerticalDivider width={1} />
                <Property title="Deskpro Tickets">{entityCount}</Property>
              </Stack>
              <Property title="Project">
                {item.projectName}
                <ExternalLink
                  href={`https://${jiraDomain}.atlassian.net/browse/${item.projectKey}`}
                />
              </Property>
              {item.epicKey && (
                <Property title="Epic">
                  {item.epicName}
                  <ExternalLink
                    href={`https://${jiraDomain}.atlassian.net/browse/${item.epicKey}`}
                  />
                </Property>
              )}
              <Property title="Status">{item.status}</Property>
              <Property title="Reporter">
                <div style={{ position: "relative" }}>
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
                </div>
              </Property>
            </>
          )}
          {hasMappedFields && (
            <FieldMapping issue={item} usableFields={usableFields} />
          )}
        </Stack>
      </Stack>
      {<HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />}
    </Fragment>
  );
};
