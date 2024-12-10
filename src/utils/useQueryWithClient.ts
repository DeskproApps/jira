import { IDeskproClient, useDeskproAppClient } from "@deskpro/app-sdk";
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";

const useQueryWithClient = <
  TQueryFnData = unknown,
  TError = unknown,
  TData extends TQueryFnData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: string[],
  queryFn: (client: IDeskproClient) => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<TData> => {
  const { client } = useDeskproAppClient();

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery(
    [client, ...key] as unknown as TQueryKey,
    () => (client && queryFn(client)) as Promise<TQueryFnData>,
    {
      ...(options ?? {}),
      enabled:
        options?.enabled === undefined ? !!client : true && options?.enabled,
    },
  );
};

export { useQueryWithClient };
