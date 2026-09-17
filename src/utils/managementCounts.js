const inactiveValues = new Set(["false", "inactive", "disabled", "0"]);

export function isActiveValue(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return !inactiveValues.has(value.toLowerCase());
  }

  return Boolean(value);
}

export function getActiveRow(row = {}) {
  return isActiveValue(
    row.activeRow ??
      row.active_row ??
      row.active ??
      row.enabled ??
      row.status,
  );
}

export function getManagementCounts(rows = []) {
  const active = rows.filter(getActiveRow).length;

  return {
    total: rows.length,
    active,
    inactive: rows.length - active,
  };
}
