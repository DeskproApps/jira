import { Layout, Settings } from "../types";

const getLayout = (mapping: Settings["mapping"]): Layout => {
  if (!mapping) {
    return { detailView: [], listView: [] };
  }

  const settingsLayout = mapping || "{}";
  let data: Layout;

  try {
    data = JSON.parse(settingsLayout) as Layout;

    if (!Array.isArray(data.detailView) && !Array.isArray(data.listView)) {
      // eslint-disable-next-line no-console
      console.error("Invalid Layout JSON");
      data = { detailView: [], listView: [] };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid Layout JSON:", error);
    data = { detailView: [], listView: [] };
  }

  return data;
};

export { getLayout };
