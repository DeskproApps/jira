import defaultMapping from "../mapping/issue.json";
import { Layout, Settings } from "../types";

const getLayout = (mapping: Settings["mapping"]): Layout => {
  if (!mapping) {
    return { detailView: defaultMapping.view, listView: defaultMapping.main };
  }

  const settingsLayout = mapping || "{}";
  let data: Layout;

  try {
    data = JSON.parse(settingsLayout) as Layout;

    if (!data.enableMapping) {
      return { detailView: defaultMapping.view, listView: defaultMapping.main };
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
    return { detailView: defaultMapping.view, listView: defaultMapping.main };
  }

  return data;
};

export { getLayout };
