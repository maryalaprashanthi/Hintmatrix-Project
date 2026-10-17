// Summaries count each student once. For a student's own view, count each day
// once instead. Prefer the latest attendance date and latest saved revision.
export function attendanceSummaryRows(rows, perDay = false) {
  const unique = new Map();
  const compare = (first, second) => String(first.attendanceDate ?? "").localeCompare(String(second.attendanceDate ?? "")) ||
    String(first.updatedAt ?? first.createdAt ?? "").localeCompare(String(second.updatedAt ?? second.createdAt ?? "")) ||
    Number(first.attendanceId ?? 0) - Number(second.attendanceId ?? 0);
  for (const row of rows) {
    const studentId = String(row.studentId ?? "").trim();
    if (!studentId) continue;
    const key = perDay ? `${studentId}:${row.attendanceDate ?? ""}` : studentId;
    if (!unique.has(key) || compare(row, unique.get(key)) >= 0) unique.set(key, row);
  }
  return [...unique.values()];
}

export const attendanceStatus = (value) => ({ p: "Present", present: "Present", l: "Late", late: "Late", a: "Absent", absent: "Absent" })[
  String(value ?? "").trim().toLowerCase()] ?? "Unknown";

export function analyzeAttendance(rows) {
  const dailyRows = attendanceSummaryRows(rows, true);
  const count = (items, status) => items.filter((row) => attendanceStatus(row.status) === status).length;
  const rate = (items) => {
    const known = items.filter((row) => attendanceStatus(row.status) !== "Unknown");
    return known.length ? (count(known, "Present") + count(known, "Late")) / known.length * 100 : null;
  };
  const sections = new Map();
  const dates = new Map();
  const students = new Map();
  for (const row of dailyRows) {
    const studentId = String(row.studentId).trim();
    if (!students.has(studentId)) students.set(studentId, []);
    students.get(studentId).push(row);
    const key = JSON.stringify([row.collegeId ?? "", row.branchId ?? "", row.courseId ?? "", row.section ?? ""]);
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key).push(row);
    if (!dates.has(row.attendanceDate)) dates.set(row.attendanceDate, []);
    dates.get(row.attendanceDate).push(row);
  }
  return {
    dailyRows,
    totalStudents: new Set(dailyRows.map((row) => String(row.studentId).trim())).size,
    present: count(dailyRows, "Present"), late: count(dailyRows, "Late"), absent: count(dailyRows, "Absent"),
    unknown: count(dailyRows, "Unknown"), rate: rate(dailyRows),
    lowAttendance: [...students.entries()].map(([studentId, items]) => {
      const latest = attendanceSummaryRows(items)[0];
      return {
        studentId, name: latest.studentName, college: latest.collegeName || "Unassigned",
        branch: latest.branchName || "Unassigned", course: latest.courseName || "Unassigned", section: latest.section || "-",
        days: items.filter((row) => attendanceStatus(row.status) !== "Unknown").length,
        present: count(items, "Present"), late: count(items, "Late"), absent: count(items, "Absent"),
        percentage: rate(items),
      };
    }).filter((student) => student.percentage != null && student.percentage < 50)
      .sort((first, second) => first.percentage - second.percentage || String(first.name).localeCompare(String(second.name))),
    sections: [...sections.entries()].map(([key, items]) => ({
      key, section: items[0].section || "Unknown", college: items[0].collegeName || "Unassigned",
      branch: items[0].branchName || "Unassigned", course: items[0].courseName || "Unassigned",
      students: new Set(items.map((row) => String(row.studentId).trim())).size,
      days: items.length, present: count(items, "Present"), late: count(items, "Late"), absent: count(items, "Absent"),
      attendance: rate(items) == null ? "—" : `${rate(items).toFixed(1)}%`,
    })),
    trend: [...dates.entries()].sort(([first], [second]) => String(first).localeCompare(String(second)))
      .map(([date, items]) => ({ date, present: count(items, "Present"), late: count(items, "Late"), absent: count(items, "Absent") })),
  };
}
