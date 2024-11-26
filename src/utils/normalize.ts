const normalize = <T extends { id: string }>(
  source: undefined|T[],
  fieldName: keyof T = "id",
): Record<string, T> => {
  if (!Array.isArray(source)) {
    return {};
  }

  return source.reduce<Record<string, T>>((acc, item) => {
    const key = item[fieldName] as string;
    acc[key] = item;
    return acc;
  }, {});
};

export { normalize };
