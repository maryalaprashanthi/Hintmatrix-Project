const reportKey = (storage) => `ruleEngineUploadReport:${storage.getItem("userId") || "anonymous"}`;

export function readRuleEngineUploadReport(storage = globalThis.localStorage) {
  try {
    const report = JSON.parse(storage?.getItem(reportKey(storage)) || "null");
    return report && Array.isArray(report.errors) ? report : null;
  } catch {
    return null;
  }
}

export function saveRuleEngineUploadReport(report, storage = globalThis.localStorage) {
  try {
    if (!storage) return;
    if (report == null) storage.removeItem(reportKey(storage));
    else storage.setItem(reportKey(storage), JSON.stringify(report));
  } catch {
    // Keep the current page usable if browser storage is unavailable or full.
  }
}
