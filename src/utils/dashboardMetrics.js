export const formatCount = (value) =>
  Number(value ?? 0).toLocaleString("en-IN");
export function dashboardGreeting(name, date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Calcutta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return `${greeting}, ${name?.trim() || "User"}!`;
}
export const formatPercentage = (value) =>
  `${Number(value ?? 0)
    .toFixed(1)
    .replace(/\.0$/, "")}%`;

export function dailyProgress(questions, goal) {
  return goal > 0
    ? Math.min(100, Math.max(0, Math.round((100 * questions) / goal)))
    : 0;
}

export function dashboardCards(data) {
  if (!data) return [];
  const hasUnits = data.totalUnits > 0;
  return [
    {
      type: "courses",
      data: formatCount(data.myCourses),
      subtitle: "Active course subscriptions",
    },
    {
      type: "practice",
      data: formatCount(data.practiceQuestions),
      subtitle: "Questions available to practise",
    },
    {
      type: "completed",
      data: hasUnits ? formatPercentage(data.completionPercentage) : "—",
      subtitle: hasUnits
        ? `${formatCount(data.attemptedUnits)} of ${formatCount(data.totalUnits)} units attempted`
        : "No practice units available",
      progress: hasUnits ? data.completionPercentage : null,
    },
    {
      type: "pending",
      data: hasUnits ? formatPercentage(data.pendingPercentage) : "—",
      subtitle: hasUnits
        ? `${formatCount(data.totalUnits - data.attemptedUnits)} units remaining`
        : "No practice units available",
      progress: hasUnits ? data.pendingPercentage : null,
    },
    {
      type: "rank",
      data: data.rank == null ? "Not ranked" : `#${data.rank}`,
      subtitle:
        data.rank == null
          ? "Complete an exam to receive a student rank"
          : `${data.rankingScope} · ${formatCount(data.rankedStudents)} ranked students`,
    },
    {
      type: "streak",
      data: `${formatCount(data.streakDays)} ${data.streakDays === 1 ? "day" : "days"}`,
      subtitle: "Consecutive practice days · India time",
    },
  ];
}

export function activityTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Calcutta",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
