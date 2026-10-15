import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { transformSync } from "esbuild";

// Render the actual JSX with controlled server data, without a browser or API.
const source = readFileSync(new URL("./Profile.jsx", import.meta.url), "utf8")
  .replace(/^import .*;\r?\n/gm, "")
  .replace("export default function Profile", "function Profile");
const compiled = transformSync(source, { loader: "jsx", jsx: "transform" }).code;
function render(profile, loading = false, error = "") {
  const states = [profile, loading, error, 0, false];
  const icon = () => null;
  const Component = new Function("React", "useState", "useEffect", "FiBookOpen", "FiShield", "FiUser", "FiUsers", "UserService",
    `${compiled}; return Profile;`)(React, () => [states.shift(), () => {}], () => {}, icon, icon, icon, icon, {});
  return renderToStaticMarkup(React.createElement(Component));
}
const base = { userId: 42, name: "Saved user", email: "saved@example.test", role: "STUDENT", activeRow: true,
  phoneNumber: "9000012345", address: "Saved address", studentCode: 200, guardianName: "Guardian",
  guardianPhoneNumber: "9000054321", collegeId: 2, collegeName: "Saved college", branchId: 3, branchName: "Saved branch",
  courseId: 4, courseName: "Saved course", sectionId: 5, sectionName: "Saved section" };

test("profile renders fetched user and student fields as text, never as editable inputs", () => {
  const html = render(base);
  for (const value of ["Saved user", "saved@example.test", "9000012345", "Saved address", "200", "Guardian", "9000054321",
    "Saved college (ID: 2)", "Saved branch (ID: 3)", "Saved course (ID: 4)", "Saved section (ID: 5)"]) {
    assert.ok(html.includes(value), value);
  }
  assert.ok(!html.includes("Edit profile"));
  assert.doesNotMatch(html, /<(input|select|textarea|form)\b/);
});

test("administrator details and inactive status reflect stored values", () => {
  const html = render({ ...base, role: "BRANCH_ADMIN", activeRow: false, employeeId: 100,
    designation: "Branch manager", studentCode: null, guardianName: null, guardianPhoneNumber: null });
  assert.ok(html.includes("Employee ID")); assert.ok(html.includes("Branch manager"));
  assert.ok(html.includes("Inactive")); assert.ok(html.includes("profile-status-inactive"));
  assert.ok(!html.includes("Guardian information")); assert.ok(!html.includes("Student ID"));
});

test("missing assignments and identity provider secrets are not fabricated or exposed", () => {
  const html = render({ userId: 9, name: "Guest", role: "GUEST", password: "secret-hash", googleId: "private-subject" });
  assert.ok(html.includes("Not assigned")); assert.ok(html.includes("Not provided"));
  assert.ok(!html.includes("Active account"));
  assert.ok(!html.includes("secret-hash")); assert.ok(!html.includes("private-subject"));
});

test("loading and failure do not show stale browser-storage profile details", () => {
  assert.ok(render(null, true).includes("Loading your profile"));
  const failed = render(null, false, "Unable to load your profile.");
  assert.ok(failed.includes("Try again")); assert.ok(failed.includes('role="alert"'));
  assert.ok(!failed.includes("profile-hero-card"));
});
