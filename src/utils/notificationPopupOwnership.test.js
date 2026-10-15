import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { transformSync } from "esbuild";

const compile = (path) => transformSync(readFileSync(new URL("../" + path, import.meta.url), "utf8"),
  { loader: "jsx", legalComments: "none" }).code;

const uploadPages = [
  "components/Section.jsx", "pages/College/Branch/Branch.jsx", "pages/Topics/Topics.jsx",
  "pages/Chapters/Chapters.jsx", "pages/College/College.jsx", "pages/College/Courses/Courses.jsx",
  "pages/Table/TableAttributes.jsx", "pages/Table/TableHeaders.jsx", "pages/Table/TableNames.jsx",
  "pages/RuleEngine/RuleEngine.jsx", "pages/Admin/Student.jsx", "pages/Questions/QuestionList.jsx",
];

test("notification-backed uploads do not also fire ordinary success toasts", () => {
  for (const path of uploadPages) {
    const source = compile(path);
    const successToasts = source.match(/toast\.success\([\s\S]*?\);/g) || [];
    assert.ok(successToasts.every((call) => !/upload/i.test(call)), path);
    assert.match(source, /toast\.error\(/, path + " must retain actionable error feedback");
  }
});

test("self activation and attendance upload do not show duplicate success banners", () => {
  assert.doesNotMatch(compile("pages/CourseSubscribe.jsx"), /is now active for/);
  assert.match(compile("pages/CourseSubscribe.jsx"), /Active subscription:/);
  assert.doesNotMatch(compile("pages/StudentAttendance/StudentAttendance.jsx"), /Attendance Excel uploaded successfully/);
});

test("normal CRUD confirmations and exam completion remain intact", () => {
  assert.match(compile("components/Section.jsx"), /toast\.success\("Section saved\."\)/);
  assert.match(compile("pages/Questions/QuestionList.jsx"), /Question updated\./);
  assert.match(compile("components/Exam/ExamPage.jsx"), /setResult\(/);
  assert.match(compile("components/MockExam/MockExamPage.jsx"), /setResult\(/);
});
