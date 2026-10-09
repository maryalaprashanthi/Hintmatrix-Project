import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";
import { createRequire } from "node:module";
import * as validation from "../src/pages/Admin/superAdminValidation.js";
import { isGuestUser } from "../src/utils/userEdit.js";
const require = createRequire(import.meta.url);
const validStudent = {
  userId: 8, roleName: "STUDENT", name: "Test Student", studentCode: 10,
  collegeId: 1, branchId: 2, courseId: 3, sectionId: 4,
  guardianName: "Test Parent", guardianPhoneNumber: "9876543211",
  email: "student@example.com", phoneNumber: "9876543210", password: "", address: "Test address",
};
const validAdmin = {
  userId: 9, name: "Test Admin", employeeId: 5, designation: "Administrator",
  collegeId: 1, branchId: 2, email: "admin@example.com", phoneNumber: "9876543212",
  password: "", address: "Test address",
};
for (const [name, check, data] of [
  ["Super Admin", validation.validateSuperAdminForm, validAdmin],
  ["Branch Admin", validation.validateBranchAdminForm, validAdmin],
  ["Student", validation.validateStudentForm, validStudent],
]) {
  test(`${name}: edit allows blank password while creation still requires one`, () => {
    assert.equal(check({ ...data, isEdit: true }).isValid, true);
    assert.deepEqual(check(data), { isValid: false, message: "Password is required." });
    assert.equal(check({ ...data, password: "newpassword" }).isValid, true);
  });
}
test("students must select a positive integer course ID; guests need no academic details", () => {
  for (const courseId of ["", null, undefined, 0, "0", -1, "oops", 1.5]) {
    assert.deepEqual(validation.validateStudentForm({ ...validStudent, courseId, isEdit: true }), { isValid: false, message: "Course is required." });
  }
  assert.equal(validation.validateStudentForm({ name: "Guest User", email: "guest@example.com", isGuest: true, isEdit: true }).isValid, true);
});

// Execute the real form callbacks with local hook state and an intercepted portal.
// No API requests, browser, or live user records are involved.
function loadForm(file, selectedKey, selected) {
  const state = [], dependencies = [], alerts = [], saves = [];
  let cursor = 0, effectCursor = 0;
  let effects = [];
  const hooks = {
    useState(initial) {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
      return [state[index], next => { state[index] = typeof next === "function" ? next(state[index]) : next; }];
    },
    useEffect(callback, deps) {
      const index = effectCursor++;
      if (!dependencies[index] || deps.some((dep, i) => dep !== dependencies[index][i])) {
        dependencies[index] = deps;
        effects.push(callback);
      }
    },
  };
  const actualReact = require("react");
  const mockedRequire = path => {
    if (path === "react") return { ...actualReact, ...hooks };
    if (path === "react/jsx-runtime") return require(path);
    if (path === "react-dom") return { createPortal: node => node };
    if (path === "react-select") return { __esModule: true, default: () => null };
    if (path === "react-icons/fa") return new Proxy({}, { get: () => () => null });
    if (path.endsWith("superAdminValidation")) return validation;
    if (path.endsWith("userEdit")) return { isGuestUser };
    if (path.endsWith("CollegeService")) return { __esModule: true, default: { getAllColleges: async () => ({ data: [] }) } };
    if (path.endsWith("BranchService")) return { __esModule: true, default: { getAllBranches: async () => ({ data: [] }) } };
    if (path.endsWith(".css")) return {};
    throw new Error(`Unexpected import: ${path}`);
  };
  const code = transformSync(readFileSync(new URL(`../src/pages/Admin/${file}`, import.meta.url), "utf8"), { loader: "jsx", format: "cjs", jsx: "automatic" }).code;
  const module = { exports: {} };
  new Function("require", "module", "exports", "alert", "document", code)(mockedRequire, module, module.exports, message => alerts.push(message), { body: {} });
  const props = { show: true, [selectedKey]: selected, onClose() {}, onSave: payload => saves.push(payload),
    colleges: [{ collegeId: 1, name: "College" }], branches: [{ collegeId: 1, branchId: 2, name: "Branch" }],
    courses: [{ collegeId: 1, branchId: 2, courseId: 3, name: "Course" }], sections: [{ collegeId: 1, branchId: 2, sectionId: 4, name: "Section" }],
  };
  const render = () => {
    cursor = effectCursor = 0; effects = [];
    const tree = module.exports.default(props);
    const pendingEffects = effects;
    pendingEffects.forEach(callback => callback());
    return tree;
  };
  render();
  const nodes = tree => {
    const found = [];
    const visit = node => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (node && typeof node === "object" && node.props) { found.push(node); visit(node.props.children); }
    };
    visit(tree); return found;
  };
  return { render, nodes, alerts, saves, props };
}
for (const [file, key, selected] of [
  ["SuperAdminForm.jsx", "selectedSuperAdminData", validAdmin],
  ["BranchAdminForm.jsx", "selectedBranchAdminData", validAdmin],
  ["StudentForm.jsx", "selectedStudentData", validStudent],
]) {
  test(`${file}: opening an edit never loads a password/hash and unchanged save omits password`, () => {
    const form = loadForm(file, key, { ...selected, password: "old-value", passwordHash: "hash" });
    const nodes = form.nodes(form.render());
    assert.equal(nodes.find(node => node.type === "input" && node.props.type === "password").props.value, "");
    nodes.find(node => node.type === "button" && node.props.className === "btn btn-primary").props.onClick();
    assert.deepEqual(form.alerts, []);
    assert.equal(form.saves.length, 1);
    assert.equal("password" in form.saves[0], false);
  });
  test(`${file}: entered replacement password is sent`, () => {
    const form = loadForm(file, key, selected);
    form.nodes(form.render()).find(node => node.type === "input" && node.props.type === "password").props.onChange({ target: { value: "newpassword" } });
    form.nodes(form.render()).find(node => node.type === "button" && node.props.className === "btn btn-primary").props.onClick();
    assert.equal(form.saves[0].password, "newpassword");
  });
}
test("guest form hides academic fields and saves only supported profile fields", () => {
  const guest = { userId: 11, roleName: "GUEST", name: "Guest User", email: "guest@example.com" };
  const form = loadForm("StudentForm.jsx", "selectedStudentData", guest);
  const tree = form.render();
  const serialized = JSON.stringify(tree, (key, value) => key === "_owner" ? undefined : value);
  assert.match(serialized, /Edit Guest/);
  assert.doesNotMatch(serialized, /Student Code|Search Course|Guardian Name|Status/);
  form.nodes(tree).find(node => node.type === "button" && node.props.className === "btn btn-primary").props.onClick();
  assert.deepEqual(form.alerts, []);
  assert.deepEqual(form.saves[0], { userId: 11, name: "Guest User", email: "guest@example.com", phoneNumber: null, address: "" });
});
test("student form refuses blank and unavailable courses before sending an update", () => {
  for (const courseId of ["", 999]) {
    const form = loadForm("StudentForm.jsx", "selectedStudentData", { ...validStudent, courseId });
    form.nodes(form.render()).find(node => node.type === "button" && node.props.className === "btn btn-primary").props.onClick();
    assert.equal(form.saves.length, 0);
    assert.match(form.alerts[0], /[Cc]ourse/);
  }
});
test("guest updates route to guest API, student updates to student API", async () => {
  const calls = [];
  const code = transformSync(readFileSync(new URL("../src/services/UserService.js", import.meta.url), "utf8"), { format: "cjs" }).code;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(path => {
    if (path.endsWith("apiClient")) return { __esModule: true, default: { put: async (...args) => { calls.push(args); return {}; } } };
    if (path.endsWith("userEdit")) return { isGuestUser };
    throw new Error(path);
  }, module, module.exports);
  await module.exports.default.updateStudentOrGuest({ userId: 11, roleName: "GUEST" }, { name: "Guest" });
  await module.exports.default.updateStudentOrGuest(validStudent, { name: "Student" });
  assert.deepEqual(calls.map(call => call[0]), ["/api/users/guest/11", "/api/users/student/8"]);
  assert.deepEqual(calls.map(call => call[1]), [{ name: "Guest" }, { name: "Student" }]);
});