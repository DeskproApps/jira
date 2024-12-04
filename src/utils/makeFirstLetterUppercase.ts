const makeFirstLetterUppercase = (str: string) => {
  if (!str) return str;

  if (typeof str === "object") return "-";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export { makeFirstLetterUppercase };
