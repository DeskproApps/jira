import {
  Property,
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { Checkbox, H1, Stack, P5 } from "@deskpro/deskpro-ui";
import { useEffect, useState } from "react";
import { useMetadata } from "./hooks";
import { DropdownSelect } from "../../components/DropdownSelect/DropdownSelect";
import { Settings, Layout } from "../../types";

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings|undefined>();
  const [hasSetSelectedSettings, setHasSetSelectedSettings] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<Partial<Layout>>({});

  const {
    fields,
    isLoading,
    projectOptions,
    issueTypeOptions,
  } = useMetadata(settings, selectedSettings.project);

  console.log(">>> mapping:", settings);

  useDeskproAppEvents({
    onAdminSettingsChange: setSettings,
  }, []);

  useEffect(() => {
    if (hasSetSelectedSettings || !settings?.mapping) return;

    setHasSetSelectedSettings(true);
    setSelectedSettings(JSON.parse(settings.mapping || "{}") as Partial<Layout>);
  }, [settings, hasSetSelectedSettings]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (Object.keys(selectedSettings).length === 0) return;
      client.setAdminSetting(JSON.stringify(selectedSettings));
    },
    [selectedSettings],
  );

  const updateSettings = (value: string, keyName: keyof Layout) => {
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


  if (!settings?.domain || !settings?.username || !settings?.api_key)
    return null;

  // if (fieldsQuery.isLoading) return <LoadingSpinner />;
  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  // if (fieldsQuery.error) {
  //   return (
  //     <H2>
  //       Wrong Settings. Please ensure you inserted the correct settings before
  //       using field mapping
  //     </H2>
  //   );
  // }

  // const fields = fieldsQuery.data;

  // if (!fields || !fields.length) {
  //   return <div>No fields found</div>;
  // }

  return (
    <Stack vertical gap={10}>
      <Stack justify="space-between" style={{ width: "100%" }}>
        <Property
          label="Default Project"
          text={
            <DropdownSelect
              error={false}
              options={projectOptions}
              onChange={(e: string) => updateSettings(e, "project")}
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
                options={issueTypeOptions}
                onChange={(e: string) => updateSettings(e, "issuetype")}
                value={selectedSettings.issuetype}
              />
            }
          />
        )}
      </Stack>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th><H1>Fields</H1></th>
            <th><H1>Create &amp; Detail View</H1></th>
            <th><H1>List View</H1></th>
          </tr>
        </thead>
        <tbody>
        {fields
          .filter((e) => e.schema && e.schema.type !== "any")
          .map((f) => (
            <tr key={f.id}>
              <td><P5>{f.name}</P5></td>
              <td className="text-center">
                <Checkbox
                  checked={selectedSettings.detailView?.includes(f.id as string)}
                  onClick={() => updateSettings(f.id as string, "detailView")}
                />
              </td>
              <td className="text-center">
                <Checkbox
                  checked={selectedSettings.listView?.includes(f.id as string)}
                  onClick={() => updateSettings(f.id as string, "listView")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Stack>
  );
};
