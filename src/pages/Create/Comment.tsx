import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useMutationWithClient,
} from "@deskpro/app-sdk";
import { Button, P8, Stack, TextArea } from "@deskpro/deskpro-ui";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addIssueComment } from "../../api/api";

export const CreateComment = () => {
  const [comment, setComment] = useState<string>("");
  const navigate = useNavigate();
  const { issueKey } = useParams();

  const submitMutation = useMutationWithClient((client) =>
    addIssueComment(client, issueKey!, comment),
  );

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
    <Stack gap={5} vertical>
      <Stack vertical style={{ width: "100%" }} gap={5}>
        <P8>New Comment</P8>
        <TextArea onChange={(e) => setComment(e.target.value)} />
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
    </Stack>
  );
};
