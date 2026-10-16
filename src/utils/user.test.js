import test from "node:test";
import assert from "node:assert/strict";
import { getUserInitials } from "./user.js";

test("avatar initials are dynamic and match the profile naming style", () => {
  assert.equal(getUserInitials("Super Admin"), "SA");
  assert.equal(getUserInitials("Charan Vamshi"), "CV");
  assert.equal(getUserInitials("Student"), "S");
  assert.equal(getUserInitials("  jane   mary smith "), "JM");
});

test("missing names use a neutral fallback", () => {
  for (const name of ["", "   ", null, undefined]) assert.equal(getUserInitials(name), "U");
});
