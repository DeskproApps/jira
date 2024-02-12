import {
  Checkbox,
  H1,
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useEffect, useState } from "react";
import { getFields } from "../context/StoreProvider/preInstallApi";

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
        settings && settings.domain && settings.username && settings.api_key
      ),
    }
  );

  useDeskproAppEvents(
    {
      onAdminSettingsChange: setSettings,
    },
    []
  );

  useEffect(() => {
    if (hasSetSelectedSettings || !settings.mapping) return;

    setHasSetSelectedSettings(true);
    setSelectedSettings(JSON.parse(settings?.mapping || "{}"));
  }, [settings, hasSetSelectedSettings]);

  useInitialisedDeskproAppClient(
    (client) => {
      if (Object.keys(selectedSettings).length === 0) return;
      client.setAdminSetting(JSON.stringify(selectedSettings));
    },
    [selectedSettings]
  );

  const updateSettings = (value: any, keyName: string) => {
    setSelectedSettings((prevState) => {
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

  if (fieldsQuery.isLoading) return <LoadingSpinner />;

  const fields = fieldsQuery.data;

  if (!fields || !fields.length) return <div>No fields found</div>;

  return (
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
  );
};
