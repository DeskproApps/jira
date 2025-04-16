import { useCallback, useEffect, useRef, useState } from "react";
import {
  LoadingSpinner,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useMetadata } from "./hooks";
import defaultMapping from "../../mapping/issue.json";
import { Mapping } from "../../components/Admin";
import type { Settings, Layout } from "../../types";
import type { FieldMeta } from "../../api/types/types";
import type { ProjectElement, Issuetype } from "../../api/types/createMeta";

export const AdminSettings = () => {
  const { context } = useDeskproLatestAppContext<unknown, Settings>()
  const [hasSetSelectedSettings, setHasSetSelectedSettings] = useState(false);
  const [selectedSettings, setSelectedSettings] = useState<Partial<Layout>>({});

  const settings = context?.settings

  const {
    fields,
    isLoading,
    projectOptions,
    issueTypeOptions,
  } = useMetadata(settings, selectedSettings.project);

  useEffect(() => {
  if (hasSetSelectedSettings || !settings?.mapping) {
    return
  };

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

  // Reset the mapping when the dependencies change to prevent scenarios where the 
  // user forgets to update their mapping switching api keys/other creds and it
  // causes the app to crash.

  const isFirstResetRun = useRef(true);
  useEffect(() => {

    // All users should have these settings so they shouldn't be undefined 
    // once the app has finished loading.
    const allPrevDefined =
      settings?.api_key !== undefined &&
      settings?.domain !== undefined &&
      settings?.username !== undefined;

    if (!isLoading && allPrevDefined) {
      // The first call will be when the app/component mounts, we don't need to reset the
      //  mapping at this point so we return early.
      if (isFirstResetRun.current) {
        isFirstResetRun.current = false;
        return;
      }

      setSelectedSettings((prevState) => ({
        ...prevState,
        project: undefined,
        issuetype: undefined,
        enableMapping: false,
        detailView: undefined,
        listView: undefined
      }));
    }
  }, [isLoading, settings?.api_key, settings?.username, settings?.domain,])


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
