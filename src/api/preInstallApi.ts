import { adminGenericProxyFetch, IDeskproClient } from "@deskpro/app-sdk";
import { Field } from "./types/types";
import { CreateMeta } from "./types/createMeta";

export const getFields = async (
  settings: any,
  client: IDeskproClient
): Promise<Field[]> => {
  const fetch = await adminGenericProxyFetch(client);

  return await fetch(
    `https://${settings.domain}.atlassian.net/rest/api/3/field`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(
          `${settings.username}:${settings.api_key}`
        )}`,
      },
    }
  ).then((res) => res.json());
};

export const getCreateMeta = async (
  client: IDeskproClient,
  settings: any
): Promise<CreateMeta> => {
  const fetch = await adminGenericProxyFetch(client);

  return await fetch(
    `https://${settings.domain}.atlassian.net/rest/api/3/issue/createmeta?expand=projects.issuetypes.fields`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(
          `${settings.username}:${settings.api_key}`
        )}`,
      },
    }
  ).then((res) => res.json());
};
