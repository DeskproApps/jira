import {
    useInitialisedDeskproAppClient,
    LoadingSpinner,
    Stack,
    Property,
    useDeskproAppTheme,
    HorizontalDivider
} from "@deskpro/app-sdk";
import {useState} from "react";
import {getMyPermissions} from "../context/StoreProvider/api";
import {orderBy} from "lodash";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useSetAppTitle} from "../hooks";

export const ViewPermissions = () => {
    const { theme } = useDeskproAppTheme();
    const [ permissionStatuses, setPermissionStatuses ] = useState<any>(null);

    useSetAppTitle("JIRA Permissions");

    useInitialisedDeskproAppClient((client) => {
        client.deregisterElement("homeContextMenu");
        client.registerElement("home", { type: "home_button" });
        getMyPermissions(client)
            .then(setPermissionStatuses)
            .then(() => setTimeout(() => client.resize(), 500))
        ;
    });

    if (permissionStatuses === null) {
        return (<LoadingSpinner />);
    }

    if (!permissionStatuses?.permissions) {
        return (<span>[Permissions Not Found]</span>);
    }

    let permissions = Object.keys(permissionStatuses.permissions).map((key) => ({
        ...permissionStatuses.permissions[key],
    }));

    permissions = orderBy(permissions, "id", "asc");

    return (
        <>
            <p style={{ fontSize: "12px" }}>
                Below is a list of your user <a href="https://support.atlassian.com/jira-work-management/docs/how-do-jira-permissions-work/" target="_blank" style={{ color: theme.colors.cyan100 }}>permissions</a>.
                The Deskpro JIRA app requires all these permissions to be granted to your user.
            </p>
            <HorizontalDivider style={{ marginBottom: "15px" }} />
            <Stack vertical gap={14}>
                {permissions.map((permission, idx) => (
                    <div style={{ width: "100%" }}>
                        <Stack justify="space-between" align="center" style={{ width: "100%", marginBottom: "10px" }} gap={10}>
                            <Property title={permission.name} key={idx}>
                                {permission.description}
                            </Property>
                            {permission.havePermission ? (
                                <FontAwesomeIcon icon={faCheckCircle} color={theme.colors.green100} />
                            ) : (
                                <FontAwesomeIcon icon={faTimesCircle} color={theme.colors.red100} />
                            )}
                        </Stack>
                        <HorizontalDivider />
                    </div>
                ))}
            </Stack>
        </>
    );
};
