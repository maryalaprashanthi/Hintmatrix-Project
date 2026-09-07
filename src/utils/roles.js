// Single source of truth for role checks.
//
// Roles seen in the app: SUPER_ADMIN, COLLEGE_ADMIN, BRANCH_ADMIN, STUDENT
// (and GUEST / unknown when nothing is stored). The role is written to
// localStorage at login by Login.jsx.

export const normalizeRole = (value = "") =>
  value.toString().trim().toUpperCase().replace(/\s+/g, "_");

// Roles allowed to create / edit / delete content
// (courses, subjects, chapters, topics, questions).
export const CONTENT_MANAGER_ROLES = [
  "SUPER_ADMIN",
  "COLLEGE_ADMIN",
  "BRANCH_ADMIN",
];

export const currentRole = () =>
  normalizeRole(localStorage.getItem("role") || "GUEST");

// True only for the admin roles above. Anything else - STUDENT, GUEST,
// null, an unrecognised value - gets read-only access. Allowlist, not
// denylist, so a new non-admin role can't accidentally gain write access.
export const canManageContent = () =>
  CONTENT_MANAGER_ROLES.includes(currentRole());
