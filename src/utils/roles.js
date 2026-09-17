// Single source of truth for role checks.
// This matches the project permission matrix used across the app.

export const normalizeRole = (value = "") =>
  value.toString().trim().toUpperCase().replace(/\s+/g, "_");

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COLLEGE_ADMIN: "COLLEGE_ADMIN",
  BRANCH_ADMIN: "BRANCH_ADMIN",
  STUDENT: "STUDENT",
  GUEST: "GUEST",
};

export const CONTENT_MANAGER_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.COLLEGE_ADMIN,
  ROLES.BRANCH_ADMIN,
];

export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.COLLEGE_ADMIN,
  ROLES.BRANCH_ADMIN,
];

export const VIEWER_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.COLLEGE_ADMIN,
  ROLES.BRANCH_ADMIN,
  ROLES.STUDENT,
  ROLES.GUEST,
];

export const ATTEMPT_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.COLLEGE_ADMIN,
  ROLES.BRANCH_ADMIN,
  ROLES.STUDENT,
];

export const RESULT_ROLES = ATTEMPT_ROLES;

export const FEATURE_ACCESS = {
  dashboard: VIEWER_ROLES,
  subscriptions: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN, ROLES.BRANCH_ADMIN],
  subscriptionsHistory: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
  ],
  subscriptionsPlans: [...VIEWER_ROLES],
  activateSubscription: [ROLES.STUDENT, ROLES.GUEST],
  colleges: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN],
  colleges: [ROLES.SUPER_ADMIN],
  branches: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN],
  sections: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN, ROLES.BRANCH_ADMIN],
  courses: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
    ROLES.GUEST,
  ],
  subjects: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
    ROLES.GUEST,
  ],
  chapters: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
    ROLES.GUEST,
  ],
  topics: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
    ROLES.GUEST,
  ],
  practiceQuestions: VIEWER_ROLES,
  manageQuestions: [ROLES.SUPER_ADMIN],
  questionTypes: [ROLES.SUPER_ADMIN],
  attemptExams: ATTEMPT_ROLES,
  manageExams: [ROLES.SUPER_ADMIN],
  attemptMockExams: ATTEMPT_ROLES,
  manageMockExams: [ROLES.SUPER_ADMIN],
  mockTests: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
  ],
  performance: ATTEMPT_ROLES,
  manageSuperAdmins: [ROLES.SUPER_ADMIN],
  manageCollegeAdmins: [ROLES.SUPER_ADMIN],
  manageBranchAdmins: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN],
  manageStudents: [ROLES.SUPER_ADMIN, ROLES.COLLEGE_ADMIN, ROLES.BRANCH_ADMIN],
  manageUsers: [ROLES.SUPER_ADMIN],
  attendance: [
    ROLES.SUPER_ADMIN,
    ROLES.COLLEGE_ADMIN,
    ROLES.BRANCH_ADMIN,
    ROLES.STUDENT,
  ],
  tableMetadata: [ROLES.SUPER_ADMIN],
  ruleEngine: [ROLES.SUPER_ADMIN],
  roles: [ROLES.SUPER_ADMIN],
  results: RESULT_ROLES,
  certificates: RESULT_ROLES,
  settings: VIEWER_ROLES,
};

export const currentRole = () =>
  normalizeRole(localStorage.getItem("role") || ROLES.GUEST);

export const canAccessFeature = (feature, role = currentRole()) => {
  const normalizedRole = normalizeRole(role);
  const allowedRoles = FEATURE_ACCESS[feature] || [];

  return (
    normalizedRole === ROLES.SUPER_ADMIN ||
    allowedRoles.includes(normalizedRole)
  );
};

export const canManageContent = () =>
  CONTENT_MANAGER_ROLES.includes(currentRole());

export const canManageQuestions = () =>
  canAccessFeature("manageQuestions", currentRole());

export const canAccessAdminArea = () => ADMIN_ROLES.includes(currentRole());
