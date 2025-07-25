import jiraRequest from "@/api/jiraRequest";
import { SearchResponse } from "@/api/types/types";
import { IDeskproClient } from "@deskpro/app-sdk";

export default async function getLabels(client: IDeskproClient) {
  const requestWithFetchAll = fetchAll<string>();
  const res = await requestWithFetchAll(
    client,
    `/label`,
  );

  return res;
};


function fetchAll<T>(
) {
  const MAX = 999;

  return async (client: IDeskproClient, baseUrl: string) => {
    const firstResponses = await jiraRequest<SearchResponse<T>>(
      client,
      { endpoint: `${baseUrl}?maxResults=${MAX}&startAt=0` }
    );

    const { total } = firstResponses;

    if (total < MAX) {
      return firstResponses.values;
    }

    const requests = new Array(10)
      .fill(0)
      .map((_, idx) => idx + 1)
      .map((idx) =>
        jiraRequest<SearchResponse<T>>(
          client,
          { endpoint: `${baseUrl}?maxResults=${MAX}&startAt=${(idx + 1) * MAX}` }
        ),
      );

    const responses = await Promise.all(requests);

    return [
      ...firstResponses.values,
      ...responses.map(({ values }) => values).flat(),
    ];
  };
};