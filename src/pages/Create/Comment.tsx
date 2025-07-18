import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useMutationWithClient,
} from "@deskpro/app-sdk";
import { Button, P8, Stack, TextArea } from "@deskpro/deskpro-ui";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "../../components/Layout";
import { addIssueComment } from "@/api/issues/comments";

export const CreateComment = () => {
  const [comment, setComment] = useState<string>("");
  const navigate = useNavigate();
  const { issueKey } = useParams();

  const submitMutation = useMutationWithClient((client) => {
    if (issueKey) {
      return addIssueComment(client,{ issueKey, comment});
    } else {
      throw new Error('no issue key found from URL parameters');
    };
  });

  useEffect(() => {
    if (submitMutation.isSuccess) {
      navigate(-1);
    }
  });

  useInitialisedDeskproAppClient(
    (client) => {
      client.deregisterElement("menuButton");
      client.deregisterElement("addIssue");
      client.deregisterElement("viewContextMenu");
      client.deregisterElement("editButton");
      client.setTitle("Create Comment");
    },
    [issueKey],
  );

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
          break;
      }
    },
  });

  return (
    <Container>
      <Stack vertical style={{ width: "100%", marginBottom: "10px" }} gap={5}>
        <P8>New Comment</P8>
        <TextArea onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setComment(event.target.value)} />
      </Stack>
      <Stack style={{ width: "100%", justifyContent: "space-between" }}>
        <Button
          loading={submitMutation.isLoading}
          text="Create"
          disabled={!comment}
          onClick={submitMutation.mutate}
        />
        <Button intent="secondary" text="Cancel" onClick={() => navigate(-1)} />
      </Stack>
    </Container>
  );
};
