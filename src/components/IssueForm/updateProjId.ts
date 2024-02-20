export const useUpdateProjId = (
  projId: string,
  setProjId: React.Dispatch<React.SetStateAction<string | undefined>>
) => {
  setProjId(projId);
};
