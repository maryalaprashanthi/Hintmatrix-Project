// Pull a human-readable string out of an axios error.
//
// Backends here return errors in several shapes: a plain string body, a Spring
// default error object ({ timestamp, status, error, message, path }), a custom
// { message }, or a validation { errors: [{ message }] }. Passing any of those
// straight to alert()/state renders "[object Object]" - this normalises them.
export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  // A row that other records still point at (FK constraint) - most common
  // reason a delete fails. Give a friendly line instead of the SQL.
  const raw =
    (typeof data === "string" && data) ||
    data?.message ||
    data?.error ||
    data?.detail ||
    (Array.isArray(data?.errors) && data.errors[0]?.message) ||
    "";

  if (
    status === 409 ||
    /constraint|foreign key|referenced|violat|still (in use|has)/i.test(raw)
  ) {
    return "This can't be deleted while other records still depend on it. Remove or move those first.";
  }

  if (typeof raw === "string" && raw.trim()) {
    // Trim a stack-trace-y message down to its first line.
    const firstLine = raw.split("\n")[0].trim();
    return firstLine.length > 160
      ? `${firstLine.slice(0, 157)}…`
      : firstLine;
  }

  if (error?.message && !/request failed with status code/i.test(error.message)) {
    return error.message;
  }

  return fallback;
};

export default getApiErrorMessage;
