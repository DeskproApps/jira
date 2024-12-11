import {
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useEffect, useState } from "react";
import { useMetadata } from "./hooks";
import { Mapping } from "../../components/Admin";
import type { Settings, Layout } from "../../types";

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


  if (!settings?.domain || !settings?.username || !settings?.api_key) {
    return null;
  }

  if (isLoading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <Mapping
      onChange={updateSettings}
      fields={fields}
      projectOptions={projectOptions}
      issueTypeOptions={issueTypeOptions}
      selectedSettings={selectedSettings}
    />
  );
};
