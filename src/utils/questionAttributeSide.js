// Header IDs are database-generated. Classify by the uploaded header name,
// not an assumed ID or a default credit side for unrecognised headers.
export const getQuestionAttributeSide = (attribute) => {
  const header = attribute?.headerName ?? attribute?.header_name ?? attribute?.header?.name;
  const values = [header, attribute?.side, attribute?.transaction, attribute?.type];
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) continue;
    const name = value.trim().toLowerCase().replace(/[_-]+/g, " ");
    const debit = /\bdebit\b/.test(name);
    const credit = /\bcredit\b/.test(name);
    if (debit !== credit) return debit ? "debit" : "credit";
    // An explicit but unknown header must not be overridden by a stale side.
    if (value === header) return null;
  }
  return null;
};
