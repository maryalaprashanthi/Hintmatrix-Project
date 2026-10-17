import test from "node:test";
import assert from "node:assert/strict";
import { attendanceSummaryRows, analyzeAttendance } from "./attendanceSummaryRows.js";

test("duplicates count once and latest saved status is used regardless of input order", () => {
  const rows = [
    { studentId: "3005", attendanceDate: "2026-10-16", attendanceId: 1, status: "Absent" },
    { studentId: "3005", attendanceDate: "2026-10-16", attendanceId: 2, status: "Present" },
    { studentId: "3002", attendanceDate: "2026-10-16", attendanceId: 3, status: "Late" },
  ];
  assert.equal(attendanceSummaryRows(rows).length, 2);
  assert.equal(attendanceSummaryRows(rows).find((row) => row.studentId === "3005").status, "Present");
  assert.equal(attendanceSummaryRows([...rows].reverse()).find((row) => row.studentId === "3005").status, "Present");
});

test("range analysis uses student-days for rates and unique students for headcounts", () => {
  const base = { collegeId: 1, branchId: 1, courseId: 1, section: "A" };
  const result = analyzeAttendance([
    { ...base, studentId: "1", attendanceDate: "2026-10-15", status: "Absent", attendanceId: 1 },
    { ...base, studentId: "1", attendanceDate: "2026-10-15", status: "Present", attendanceId: 2 },
    { ...base, studentId: "1", attendanceDate: "2026-10-16", status: "Absent", attendanceId: 3 },
    { ...base, studentId: "2", attendanceDate: "2026-10-16", status: "Late", attendanceId: 4 },
  ]);
  assert.equal(result.totalStudents, 2);
  assert.equal(result.dailyRows.length, 3);
  assert.equal(result.rate, 2 / 3 * 100);
  assert.deepEqual(result.trend.map((day) => day.present + day.late + day.absent), [1, 2]);
  assert.equal(result.sections[0].students, 2);
  assert.equal(result.sections[0].attendance, "66.7%");
});

test("same section name in different colleges stays separate and unknown statuses are visible", () => {
  const result = analyzeAttendance([
    { studentId: "1", collegeId: 1, section: "A", attendanceDate: "2026-10-16", status: "P" },
    { studentId: "2", collegeId: 2, section: "A", attendanceDate: "2026-10-16", status: "unexpected" },
  ]);
  assert.equal(result.sections.length, 2);
  assert.equal(result.unknown, 1);
  assert.equal(result.rate, 100);
  assert.equal(analyzeAttendance([]).rate, null);
});

test("low attendance includes only rates strictly below 50%, counts late, and ignores unknown statuses", () => {
  const rows = [
    { studentId: "1", studentName: "Low", attendanceDate: "2026-10-14", status: "Present", attendanceId: 1 },
    { studentId: "1", studentName: "Low", attendanceDate: "2026-10-15", status: "Absent", attendanceId: 2 },
    { studentId: "1", studentName: "Low", attendanceDate: "2026-10-16", status: "Absent", attendanceId: 3 },
    { studentId: "2", studentName: "Boundary", attendanceDate: "2026-10-15", status: "Late" },
    { studentId: "2", studentName: "Boundary", attendanceDate: "2026-10-16", status: "Absent" },
    { studentId: "3", studentName: "Unknown", attendanceDate: "2026-10-16", status: "Other" },
  ];
  const result = analyzeAttendance([...rows, rows[2]]).lowAttendance;
  assert.equal(result.length, 1);
  assert.equal(result[0].studentId, "1");
  assert.equal(result[0].days, 3);
  assert.equal(result[0].absent, 2);
  assert.equal(result[0].percentage, 1 / 3 * 100);
});

test("all-date admin totals count students while self-service counts distinct days", () => {
  const rows = [
    { studentId: "3005", attendanceDate: "2026-10-15", attendanceId: 5 },
    { studentId: "3005", attendanceDate: "2026-10-16", attendanceId: 2 },
    { studentId: "3005", attendanceDate: "2026-10-16", attendanceId: 3 },
  ];
  assert.equal(attendanceSummaryRows(rows).length, 1);
  assert.equal(attendanceSummaryRows(rows)[0].attendanceDate, "2026-10-16");
  assert.equal(attendanceSummaryRows(rows, true).length, 2);
});
