import { useCallback, useEffect, useState } from "react";
import {
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useMetadata } from "./hooks";
import defaultMapping from "../../mapping/issue.json";
import { Mapping } from "../../components/Admin";
import type { Settings, Layout } from "../../types";
import type { FieldMeta } from "../../api/types/types";
import type { ProjectElement, Issuetype } from "../../api/types/createMeta";

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

  useInitialisedDeskproAppClient((client) => {
    if (Object.keys(selectedSettings).length === 0) {
      return;
    }

    client.setAdminSetting(JSON.stringify(selectedSettings));
  }, [selectedSettings]);

  const onUpdateProject = useCallback((project: ProjectElement["id"]) => {
    setSelectedSettings((prevState) => ({ ...prevState, project }));
  }, []);

  const onUpdateIssueType = useCallback((issuetype: Issuetype["id"]) => {
    setSelectedSettings((prevState) => ({ ...prevState, issuetype }));
  }, []);

  const onUpdateEnableMapping = useCallback(() => {
    setSelectedSettings((prevState) => ({
      ...prevState,
      enableMapping: !selectedSettings.enableMapping,
    }));
  }, [selectedSettings]);

  const onUpdateMapping = (value: Array<FieldMeta["id"]>, keyName: keyof Layout) => {
    setSelectedSettings((prevState) => ({ ...prevState, [keyName]: value }));
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
      onUpdateMapping={onUpdateMapping}
      onUpdateProject={onUpdateProject}
      onUpdateIssueType={onUpdateIssueType}
      onUpdateEnableMapping={onUpdateEnableMapping}
      fields={fields}
      projectOptions={projectOptions}
      issueTypeOptions={issueTypeOptions}
      selectedSettings={{
        ...selectedSettings,
        detailView: selectedSettings.detailView || defaultMapping.view,
        listView: selectedSettings.listView || defaultMapping.main,
      }}
    />
  );
};
