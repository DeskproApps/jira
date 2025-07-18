import {
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { CommentsList } from "../../components/CommentsList/CommentsList";
import { Container } from "../../components/Layout";
import { ContextData, ContextSettings } from "@/types/deskpro";
import { FieldMapping } from "../../components/FieldMapping/FieldMapping";
import { getIssueFields } from "@/api/issues/fields";
import { getLayout } from "../../utils/utils";
import { H2, Stack } from "@deskpro/deskpro-ui";
import { listLinkedIssues } from "@/api/issues";
import { LoadingSpinnerCenter } from "../../components/LoadingSpinnerCenter/LoadingSpinnerCenter";
import { queryClient } from "../../query";
import { useEffect, useMemo, useState } from "react";
import { useLinkIssues } from "../../hooks/hooks";
import { useNavigate, useParams } from "react-router-dom";
import IssueJson from "../../mapping/issue.json";

export const ViewObject = () => {
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  );
  const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const navigate = useNavigate();
  const { objectId, objectView } = useParams();
  const { unlinkIssues } = useLinkIssues();

  const objectQuery = useQueryWithClient(
    [objectId as string, objectView as string],
    (client) => listLinkedIssues(client, [objectId as string]),
    { enabled: !!objectId },
  );

  const metadataFieldsQuery = useQueryWithClient(["issueMetadataFields"], (client) => {
    if (!objectId) {
      return Promise.resolve(null)
    }

    return getIssueFields(client, objectId)
  });

  useEffect(() => {
    const data = getLayout(context?.settings.mapping);

    if (!data) {
      setMappedFields([]);
      setHasMappedFields(false);
      return
    }
    
    setMappedFields(data.detailView ? ["parent", ...data.detailView] : []);
    setHasMappedFields(!!data.detailView?.length);
  }, [context]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (!objectQuery.isSuccess) return;

      client.registerElement("editButton", { type: "edit_button" });
      client.registerElement("homeButton", { type: "home_button" });

      client.registerElement("menuButton", {
        type: "menu",
        items: [
          {
            title: "Unlink Issue",
            payload: {
              type: "changePage",
              page: "/",
            },
          },
        ],
      });

      client.setTitle(objectQuery.data[0].key || "View");
    },
    [objectQuery.isSuccess, objectView],
  );

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");

          break;

        case "menuButton":
          unlinkIssues([objectId as string]);

          break;

        case "editButton":
          queryClient.clear();
          navigate(`/edit/${objectId}`);

          break;

        case "addIssue":
          navigate(`/findOrCreate`);

          break;
      }
    },
  });

  const usableFields = useMemo(() => {
    const fields = metadataFieldsQuery.data?.fields;
    if (!fields || hasMappedFields === undefined) {
      return []
    }

    return Object.values(fields).filter((field) =>
      (hasMappedFields ? mappedFields : IssueJson.view).includes(field.key),
    );
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  if (!objectView || (objectView !== "list" && objectView !== "single"))
    return <H2>Please use a accepted Object View</H2>;

  if (!objectQuery.isSuccess) {
    return <LoadingSpinnerCenter />;
  }

  const data = objectQuery.data;

  return (
    <Container>
      <Stack style={{ width: "100%" }} vertical gap={10}>
        <FieldMapping
          items={data}
          metadata={usableFields}
          externalChildUrl={IssueJson.externalChildUrl}
          childTitleAccessor={(e) => e[IssueJson.titleKeyName] as string}
        />
        <CommentsList issueKey={objectId ?? ''} />
      </Stack>
    </Container>
  );
};