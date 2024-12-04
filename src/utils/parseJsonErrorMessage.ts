const parseJsonErrorMessage = (error: string) => {
  try {
    const parsedError = JSON.parse(error) as { status: string; message: string };

    if (parsedError.status && parsedError.message) {
      return `Status: ${parsedError.status} \n Message: ${parsedError.message}`;
    }

    return error;
  } catch {
    return error;
  }
};

export { parseJsonErrorMessage };
