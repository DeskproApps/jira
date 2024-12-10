const toBase64 = (payload: string): string => {
  if (window && typeof window.btoa === "function") {
    return window.btoa(payload);
  }

  throw new Error("no base64 encoding method available");
};

export { toBase64 };
