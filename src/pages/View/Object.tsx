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
import { CommentsList } from "../../components/CommentsList/CommentsList";
import { useLinkIssues } from "../../hooks/hooks";
import { queryClient } from "../../query";
import { Container } from "../../components/Layout";
import { getLayout } from "../../utils/utils";
import { TicketData, Settings } from "../../types";

export const ViewObject = () => {
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  );
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const navigate = useNavigate();
  const { objectId, objectView } = useParams();
  const { unlinkIssues } = useLinkIssues();

  const objectQuery = useQueryWithClient(
    [objectId as string, objectView as string],
    (client) => listLinkedIssues(client, [objectId as string]),
    { enabled: !!objectId },
  );

  const metadataFieldsQuery = useQueryWithClient(["metadataFields"], getFields);

  useEffect(() => {
    const data = getLayout(context?.settings.mapping);

    if (!data) {
      setMappedFields([]);
      setHasMappedFields(false);
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
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) =>
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