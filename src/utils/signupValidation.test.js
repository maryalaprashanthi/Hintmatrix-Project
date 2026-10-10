import test from "node:test";
import assert from "node:assert/strict";
import { signupFieldErrors } from "./signupValidation.js";

const valid = { email: "student@example.com", password: "Commerce1!", confirmPassword: "Commerce1!" };
test("valid signup and trimmed email pass", () => {
  assert.deepEqual(signupFieldErrors(valid), {});
  assert.deepEqual(signupFieldErrors({ ...valid, email: " student@example.com " }), {});
});
test("missing or malformed emails get inline errors", () => {
  for (const email of ["", "student", "a@", "a@b", "a b@example.com", "a@@example.com"]) {
    assert.ok(signupFieldErrors({ ...valid, email }).email);
  }
});
test("each password requirement is enforced", () => {
  for (const password of ["", "Aa1!", "commerce1!", "COMMERCE1!", "Commerce!!", "Commerce12", "Commerce1 "]) {
    assert.ok(signupFieldErrors({ ...valid, password, confirmPassword: password }).password);
  }
});
test("confirmation is required and must match", () => {
  assert.ok(signupFieldErrors({ ...valid, confirmPassword: "" }).confirmPassword);
  assert.ok(signupFieldErrors({ ...valid, confirmPassword: "Different1!" }).confirmPassword);
});
test("BCrypt byte length limit includes multibyte characters", () => {
  const password = "Aa1!" + "a".repeat(68);
  assert.deepEqual(signupFieldErrors({ ...valid, password, confirmPassword: password }), {});
  assert.ok(signupFieldErrors({ ...valid, password: password + "a" }).password);
  assert.ok(signupFieldErrors({ ...valid, password: "Aa1!" + "€".repeat(24) }).password);
});
