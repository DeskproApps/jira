import {
  ExternalIconLink,
  Link,
  LoadingSpinner,
  useDeskproAppClient,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { AppLogo } from "../AppLogo/AppLogo";
import { ContextData, ContextSettings } from "@/types/deskpro";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FieldMeta, IssueFieldsMetaResponse, IssueItem } from "../../api/types/types";
import { getIssueFields } from "@/api/issues/fields";
import { getLayout, substitutePlaceholders } from "../../utils/utils";
import { H1, H3, Icon, Stack } from "@deskpro/deskpro-ui";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { MapFieldValues } from "../MapFieldValues/MapFieldValues";
import { useEffect, useRef, useState } from "react";
import IssueJson from "../../mapping/issue.json";


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
  shouldFetchIssueFields?: boolean;
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
  shouldFetchIssueFields
}: Props) => {
  const { theme } = useDeskproAppTheme();
  const navigate = useNavigate();
  const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
  const { client } = useDeskproAppClient();
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  )
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const [hasMappingEnabled, setHasMappingEnabled] = useState<boolean>(false);

  const [issueMetadata, setIssueMetadata] = useState<Record<string, IssueFieldsMetaResponse>>({});

  // Track which issues [metadata] have already been processed/fetched
  const processedKeys = useRef<Set<string>>(new Set());

  const [isMetadataLoading, setIsMetadataLoading] = useState<boolean>(false);

  // Fetch issue metadata effect
  useEffect(() => {
    if (!client || !shouldFetchIssueFields || items.length < 1 || !hasMappingEnabled) {
      return
    }
    const fetchMetadata = async () => {
      setIsMetadataLoading(true)

      // Extract unique issue keys (Prevent fetching an issue twice)
      const uniqueIssueKeys = Array.from(new Set(items.map((item) => item.key)));

      const metadataByKey: Record<string, IssueFieldsMetaResponse> = {};

      // Fetch metadata in parallel (performance reasons)
      const promises = uniqueIssueKeys.map(async (key) => {
        if (!processedKeys.current.has(key)) {
          try {
            const metadata = await getIssueFields(client, key);

            metadataByKey[key] = metadata;

            // Mark this key as processed
            processedKeys.current.add(key);
          } catch (error) {
           // eslint-disable-next-line no-console
           console.warn(error instanceof Error? error.message : error)
          }
        }
      })

      // Wait for all metadata fetching to complete
      await Promise.all(promises);

      // Update the state with the new metadata
      setIssueMetadata((prev) => ({ ...prev, ...metadataByKey }))
      setIsMetadataLoading(false)
    };

    if (items.length > 0) {
      fetchMetadata();
    }
  }, [client, hasMappingEnabled, items, shouldFetchIssueFields])


  // Mapped fields effect
  useEffect(() => {
    if (shouldFetchIssueFields) {
      const data = getLayout(context?.settings.mapping);

      if (!data) {
        setMappedFields([]);
        setHasMappedFields(false)
        return
      }

      setHasMappingEnabled(data.enableMapping ?? false)
      setMappedFields(data.listView ? ["parent", ...data.listView] : []);
      setHasMappedFields(!!data.listView?.length)
    }

  }, [context, shouldFetchIssueFields]);

  if (shouldFetchIssueFields && hasMappingEnabled && isMetadataLoading) {
    return <div style={{ width: "100%" }}><LoadingSpinner /></div>
  }

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
        const issueFields = issueMetadata[item.key]?.fields
        const usableFields = shouldFetchIssueFields && hasMappingEnabled
          ? issueFields
            ? Object.values(issueFields).filter((field) =>
              (hasMappedFields ? mappedFields : IssueJson.view).includes(field.key)
            )
            : metadata
          : metadata

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
              <MapFieldValues issue={item} usableFields={usableFields} />
            </Stack>
            {<HorizontalDivider />}
          </Stack>
        )
      })}
    </Stack>
  );
};
