import {
  ExternalIconLink,
  Link,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { H1, H3, Icon, Stack } from "@deskpro/deskpro-ui";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FieldMeta, IssueItem } from "../../api/types/types";
import { substitutePlaceholders } from "../../utils/utils";
import { AppLogo } from "../AppLogo/AppLogo";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { MapFieldValues } from "../MapFieldValues/MapFieldValues";
import { TicketData, Settings } from "../../types";

type Props = {
  items: IssueItem[];
  internalUrl?: string;
  externalUrl?: string;
  metadata: FieldMeta[];
  internalChildUrl?: string;
  externalChildUrl?: string;
  childTitleAccessor?: (field: IssueItem) => string;
  title?: string;
  hasCheckbox?: boolean;
  createPage?: string;
};

export const FieldMapping = ({
  items,
  externalUrl,
  internalUrl,
  metadata,
  internalChildUrl,
  externalChildUrl,
  childTitleAccessor,
  title,
  createPage,
}: Props) => {
  const { theme } = useDeskproAppTheme();
  const navigate = useNavigate();
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();

  return (
    <Stack vertical gap={4} style={{ width: "100%" }}>
      {(title || internalUrl || externalUrl) && (
        <Stack
          style={{
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Stack style={{ textAlign: "center", alignItems: "center" }} gap={3}>
            {title && internalUrl && items.length > 0 ? (
              <Link as={RouterLink} title="title" to={internalUrl}>
                {title} ({items.length})
              </Link>
            ) : (
              title && (
                <H1>
                  {title} ({items.length})
                </H1>
              )
            )}
            {createPage && (
              <div
                style={{
                  cursor: "pointer",
                  ...(items.length > 0 ? { color: theme?.colors.cyan100 } : {}),
                }}
                onClick={() => navigate(createPage)}
              >
                <Icon icon={faPlus} />
              </div>
            )}
          </Stack>
          {externalUrl && (
            <ExternalIconLink
              href={substitutePlaceholders(externalUrl, {
                ...(context?.settings || {}),
              })}
              icon={<AppLogo />}
            />
          )}
        </Stack>
      )}
      
      {items.map((item, i) => {
        return (
          <Stack vertical gap={4} style={{ width: "100%" }} key={i}>
            {(internalChildUrl || childTitleAccessor || externalChildUrl) && (
              <Stack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {internalChildUrl && childTitleAccessor && (
                  <Link
                    as={RouterLink}
                    to={substitutePlaceholders(internalChildUrl, { ...item })}
                    replace={true}
                  >
                    {childTitleAccessor(item)}
                  </Link>
                )}
                {!internalChildUrl && childTitleAccessor && (
                  <H3 style={{ fontSize: "12px" }}>{childTitleAccessor(item)}</H3>
                )}
                {externalChildUrl && (
                  <ExternalIconLink
                    href={substitutePlaceholders(externalChildUrl, {
                      ...context?.settings,
                      ...item,
                    })}
                    icon={<AppLogo />}
                  ></ExternalIconLink>
                )}
              </Stack>
            )}
            <Stack vertical style={{ width: "100%" }} gap={8}>
              <MapFieldValues issue={item} usableFields={metadata} />
            </Stack>
            {<HorizontalDivider />}
          </Stack>
        )
      })}
    </Stack>
  );
};
