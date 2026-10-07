import test from "node:test";
import assert from "node:assert/strict";
import { dashboardCards, dailyProgress, activityTime, dashboardGreeting } from "../src/utils/dashboardMetrics.js";

test("empty dashboard has no sample values", () => {
  assert.deepEqual(dashboardCards(null), []);
  const cards = dashboardCards({ myCourses: 0, practiceQuestions: 0, totalUnits: 0,
    attemptedUnits: 0, rank: null, streakDays: 0 });
  assert.equal(cards.find(c => c.type === "rank").data, "Not ranked");
  assert.equal(cards.find(c => c.type === "completed").data, "—");
  assert.equal(cards.find(c => c.type === "streak").data, "0 days");
});
test("tiles preserve real zero completion and show remaining units", () => {
  const cards = dashboardCards({ myCourses: 2, practiceQuestions: 7, totalUnits: 10,
    attemptedUnits: 0, completionPercentage: 0, pendingPercentage: 100,
    rank: 4, rankedStudents: 18, rankingScope: "Your branch", streakDays: 1 });
  assert.equal(cards.find(c => c.type === "completed").progress, 0);
  assert.equal(cards.find(c => c.type === "pending").subtitle, "10 units remaining");
  assert.equal(cards.find(c => c.type === "rank").data, "#4");
  assert.equal(cards.find(c => c.type === "streak").data, "1 day");
});
test("daily goal reflects actual count and caps ring at 100 percent", () => {
  assert.equal(dailyProgress(0, 20), 0);
  assert.equal(dailyProgress(12, 20), 60);
  assert.equal(dailyProgress(25, 20), 100);
  assert.equal(dailyProgress(12, 0), 0);
});
test("activity dates use India timezone across UTC midnight", () => {
  assert.match(activityTime("2026-10-04T20:00:00Z"), /5 Oct/);
  assert.equal(activityTime("invalid"), "—");
});

test("greeting uses the logged-in name and India morning, afternoon and evening", () => {
  assert.equal(dashboardGreeting("Narsa", new Date("2026-10-05T05:00:00Z")), "Good Morning, Narsa! 👋");
  assert.equal(dashboardGreeting("Narsa", new Date("2026-10-05T06:30:00Z")), "Good Afternoon, Narsa! 👋");
  assert.equal(dashboardGreeting("Narsa", new Date("2026-10-05T11:30:00Z")), "Good Evening, Narsa! 👋");
  assert.equal(dashboardGreeting("  ", new Date("2026-10-05T05:00:00Z")), "Good Morning, User! 👋");
});
