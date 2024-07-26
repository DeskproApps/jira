/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LoadingSpinner,
  Property,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Checkbox, H1, H2, Stack } from "@deskpro/deskpro-ui";
import { useEffect, useMemo, useState } from "react";
import { getCreateMeta, getFields } from "../../api/preInstallApi";
import { DropdownSelect } from "../../components/DropdownSelect/DropdownSelect";

export const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [hasSetSelectedSettings, setHasSetSelectedSettings] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<
    Record<string, string[]>
  >({});

  const fieldsQuery = useQueryWithClient(
    ["fields"],
    (client) => getFields(settings, client),
    {
      enabled: Boolean(
        settings && settings.domain && settings.username && settings.api_key,
      ),
    },
  );

  const createMetaQuery = useQueryWithClient(
    ["createMetaQuery"],
    (client) => getCreateMeta(client, settings),
    {
      enabled: Boolean(
        settings && settings.domain && settings.username && settings.api_key,
      ),
    },
  );

  useDeskproAppEvents(
    {
      onAdminSettingsChange: setSettings,
    },
    [],
  );

  useEffect(() => {
    if (hasSetSelectedSettings || !settings?.mapping) return;

    setHasSetSelectedSettings(true);
    setSelectedSettings(JSON.parse(settings?.mapping || "{}"));
  }, [settings, hasSetSelectedSettings]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (Object.keys(selectedSettings).length === 0) return;
      client.setAdminSetting(JSON.stringify(selectedSettings));
    },
    [selectedSettings],
  );

  const updateSettings = (value: any, keyName: string) => {
    setSelectedSettings((prevState) => {
      if (["project", "issuetype"].includes(keyName)) {
        return {
          ...prevState,
          [keyName]: value,
        };
      }
      const newArray = [...(prevState[keyName] || [])];
      const index = newArray.indexOf(value);

      if (index === -1) {
        // Value not found, add it to the array
        newArray.push(value);
      } else {
        // Value found, remove it from the array
        newArray.splice(index, 1);
      }

      return {
        ...prevState,
        [keyName]: newArray,
      };
    });
  };

  const projects = useMemo(() => {
    if (!createMetaQuery.isSuccess) return [];

    return createMetaQuery.data.projects.map((p) => {
      return {
        key: p.name,
        label: p.name,
        value: p.id,
        type: "value" as const,
      };
    });
  }, [createMetaQuery]);

  const issueTypes = useMemo(() => {
    if (!createMetaQuery.isSuccess || !selectedSettings.project) return [];

    return (
      createMetaQuery.data.projects
        .find((e) => e.id === (selectedSettings.project as unknown as string))
        ?.issuetypes.map((p) => {
          return {
            key: p.name,
            label: p.name,
            type: "value" as const,
            value: p.id,
          };
        }) ?? []
    );
  }, [
    createMetaQuery.data?.projects,
    createMetaQuery.isSuccess,
    selectedSettings.project,
  ]);

  if (!settings || !settings.domain || !settings.username || !settings.api_key)
    return null;

  if (fieldsQuery.isLoading) return <LoadingSpinner />;

  if (fieldsQuery.error) {
    return (
      <H2>
        Wrong Settings. Please ensure you inserted the correct settings before
        using field mapping
      </H2>
    );
  }

  const fields = fieldsQuery.data;

  if (!fields || !fields.length) return <div>No fields found</div>;

  return (
    <Stack vertical gap={10}>
      <Stack justify="space-between" style={{ width: "100%" }}>
        <Property
          label="Default Project"
          text={
            <DropdownSelect
              error={false}
              options={projects}
              onChange={(e: any) => updateSettings(e, "project")}
              value={selectedSettings.project}
            />
          }
        />

        {selectedSettings.project && (
          <Property
            label="Default Issue Type"
            text={
              <DropdownSelect
                error={false}
                options={issueTypes}
                onChange={(e: any) => updateSettings(e, "issuetype")}
                value={selectedSettings.issuetype}
              />
            }
          />
        )}
      </Stack>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "100%",
          rowGap: "10px",
        }}
      >
        <H1>Fields</H1>
        <H1>Create &amp; Detail View</H1>
        <H1>List View</H1>
        {fields
          .filter((e) => e.schema && e.schema.type !== "any")
          .map((f) => (
            <>
              <td>{f.name}</td>
              <td className="text-center">
                <Checkbox
                  checked={selectedSettings.detailView?.includes(f.id)}
                  onClick={() => updateSettings(f.id, "detailView")}
                />
              </td>
              <td className="text-center">
                <Checkbox
                  checked={selectedSettings.listView?.includes(f.id)}
                  onClick={() => updateSettings(f.id, "listView")}
                />
              </td>
            </>
          ))}
      </div>
    </Stack>
  );
};
