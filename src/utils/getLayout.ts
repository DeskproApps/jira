import { Layout, Settings } from "../types";
import defaultMapping from "../mapping/issue.json";

const getLayout = (mapping: Settings["mapping"]): Layout => {

  const baseObj = { detailView: defaultMapping.view, listView: defaultMapping.main }
  if (!mapping) {
    return baseObj
  }

  const settingsLayout = mapping || "{}";
  let data: Layout;

  try {
    data = JSON.parse(settingsLayout) as Layout;

    // Don't include mapped fields if the flag is disabled but
    // include the default project and issue type from the app setup 
    if (!data.enableMapping) {
      return { project: data.project, issuetype: data.issuetype, ...baseObj };
    }

    if (!Array.isArray(data.detailView)) {
      // eslint-disable-next-line no-console
      console.error("Invalid Details View Layout JSON");
      return { ...data, detailView: defaultMapping.view };
    }

    if (!Array.isArray(data.listView)) {
      // eslint-disable-next-line no-console
      console.error("Invalid List Layout JSON");
      data = { ...data, listView: defaultMapping.main };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid Layout JSON:", error);
    return baseObj;
  }

  return data;
};

export { getLayout };
