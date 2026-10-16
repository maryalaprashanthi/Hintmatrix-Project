import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./Navbar.css", import.meta.url), "utf8");
test("header stays on one row and the search can shrink", () => {
  assert.match(css, /header\.navbar\s*\{[^}]*flex-wrap:\s*nowrap;/);
  assert.match(css, /\.navbar-center\s*\{[^}]*flex:\s*1 1 400px;[^}]*min-width:\s*0;/);
  assert.match(css, /\.navbar-right\s*\{[^}]*flex:\s*0 0 auto;[^}]*margin-left:\s*auto;/);
});
test("initials avatar is a fixed-size outlined circle", () => {
  assert.match(css, /\.navbar-profile-avatar\s*\{[^}]*width:\s*36px;[^}]*height:\s*36px;[^}]*border-radius:\s*50%;[^}]*border:\s*1.5px solid/);
});
test("mobile sizing still overrides the scoped desktop header", () => {
  assert.match(css, /@media \(max-width: 768px\)\s*\{\s*header\.navbar\s*\{[^}]*height:\s*54px;/);
});
