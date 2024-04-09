import { Stack } from "@deskpro/deskpro-ui";
import {
  useInitialisedDeskproAppClient,
  LoadingSpinner,
  Property,
  useDeskproAppTheme,
  HorizontalDivider,
} from "@deskpro/app-sdk";
import { useState } from "react";

import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getMyPermissions } from "../api/api";
import { useSetAppTitle } from "../hooks/hooks";

export const ViewPermissions = () => {
  const { theme } = useDeskproAppTheme();
  const [permissionStatuses, setPermissionStatuses] = useState<any>(null);

  useSetAppTitle("JIRA Permissions");

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("homeContextMenu");
    client.registerElement("home", { type: "home_button" });
    getMyPermissions(client)
      .then(setPermissionStatuses)
      .then(() => setTimeout(() => client.resize(), 500));
  });

  if (permissionStatuses === null) {
    return <LoadingSpinner />;
  }

  if (!permissionStatuses?.permissions) {
    return <span>[Permissions Not Found]</span>;
  }

  const permissions = Object.keys(permissionStatuses.permissions)
    .map((key) => ({
      ...permissionStatuses.permissions[key],
    }))
    .sort((a, b) => a.id - b.id);

  return (
    <>
      <p style={{ fontSize: "12px" }}>
        Below is a list of your user{" "}
        <a
          href="https://support.atlassian.com/jira-work-management/docs/how-do-jira-permissions-work/"
          target="_blank"
          style={{ color: theme.colors.cyan100 }}
        >
          permissions
        </a>
        . The Deskpro JIRA app requires all these permissions to be granted to
        your user.
      </p>
      <HorizontalDivider style={{ marginBottom: "15px" }} />
      <Stack vertical gap={14}>
        {permissions.map((permission, idx) => (
          <div style={{ width: "100%" }}>
            <Stack
              justify="space-between"
              align="center"
              style={{ width: "100%", marginBottom: "10px" }}
              gap={10}
            >
              <Property
                label={permission.name}
                key={idx}
                text={permission.description}
              />
              {permission.havePermission ? (
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  color={theme.colors.green100}
                />
              ) : (
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  color={theme.colors.red100}
                />
              )}
            </Stack>
            <HorizontalDivider />
          </div>
        ))}
      </Stack>
    </>
  );
};
