import {
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFields, listLinkedIssues } from "../../api/api";
import { FieldMapping } from "../../components/FieldMapping/FieldMapping";
import { LoadingSpinnerCenter } from "../../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import IssueJson from "../../mapping/issue.json";
import { H2, Stack } from "@deskpro/deskpro-ui";

export const ViewObject = () => {
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  );
  const { context } = useDeskproLatestAppContext();
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const navigate = useNavigate();
  const { objectId, objectView } = useParams();

  const objectQuery = useQueryWithClient(
    [objectId as string, objectView as string],
    (client) => listLinkedIssues(client, [objectId as string]),
    {
      enabled: !!objectId,
    },
  );

  const metadataFieldsQuery = useQueryWithClient(
    ["metadataFields"],
    (client) => getFields(client),
    {
      enabled: mappedFields && mappedFields?.length !== 0,
    },
  );

  useEffect(() => {
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) {
      setMappedFields([]);
      setHasMappedFields(false);
    }
    setMappedFields(data.detailView ?? []);
    setHasMappedFields(!!data.detailView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (!objectQuery.isSuccess) return;

      client.registerElement("editButton", {
        type: "edit_button",
      });

      client.deregisterElement("menuButton");

      client.setTitle(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        (objectQuery.data[0].key as string) || "View",
      );
    },
    [objectQuery.isSuccess, objectView],
  );

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;

        case "editButton":
          navigate(`/edit/${objectId}`);

          break;

        case "addIssue":
          navigate(`/findOrCreate`);

          break;
      }
    },
  });

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) =>
      (hasMappedFields ? mappedFields : IssueJson.main).includes(field.key),
    );
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  if (!objectView || (objectView !== "list" && objectView !== "single"))
    return <H2>Please use a accepted Object View</H2>;

  if (!objectQuery.isSuccess) {
    return <LoadingSpinnerCenter />;
  }

  const data = objectQuery.data;

  return (
    <Stack style={{ width: "100%" }} vertical gap={10}>
      <FieldMapping
        items={data}
        metadata={usableFields}
        externalChildUrl={IssueJson.externalChildUrl}
        childTitleAccessor={(e) => e[IssueJson.titleKeyName]}
      />
    </Stack>
  );
};