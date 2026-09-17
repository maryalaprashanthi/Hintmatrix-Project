import test from "node:test";
import assert from "node:assert/strict";

import { normalizeRole, canAccessFeature } from "./roles.js";

test("normalizeRole trims and uppercases role names", () => {
  assert.equal(normalizeRole(" student "), "STUDENT");
  assert.equal(normalizeRole("branch admin"), "BRANCH_ADMIN");
});

test("dashboard is open to all authenticated roles", () => {
  assert.equal(canAccessFeature("dashboard", "SUPER_ADMIN"), true);
  assert.equal(canAccessFeature("dashboard", "STUDENT"), true);
  assert.equal(canAccessFeature("dashboard", "GUEST"), true);
});

test("subscription access follows admin-only rules", () => {
  assert.equal(canAccessFeature("subscriptions", "SUPER_ADMIN"), true);
  assert.equal(canAccessFeature("subscriptions", "COLLEGE_ADMIN"), true);
  assert.equal(canAccessFeature("subscriptions", "STUDENT"), false);
  assert.equal(canAccessFeature("subscriptions", "GUEST"), false);
});

test("content management is restricted to admin roles", () => {
  assert.equal(canAccessFeature("questions", "SUPER_ADMIN"), true);
  assert.equal(canAccessFeature("questions", "COLLEGE_ADMIN"), true);
  assert.equal(canAccessFeature("questions", "BRANCH_ADMIN"), true);
  assert.equal(canAccessFeature("questions", "STUDENT"), false);
});

test("college admin can manage branch admins and students, but not college admins", () => {
  assert.equal(canAccessFeature("manageBranchAdmins", "COLLEGE_ADMIN"), true);
  assert.equal(canAccessFeature("manageBranchAdmins", "BRANCH_ADMIN"), false);
  assert.equal(canAccessFeature("manageStudents", "COLLEGE_ADMIN"), true);
  assert.equal(canAccessFeature("manageCollegeAdmins", "COLLEGE_ADMIN"), false);
});
