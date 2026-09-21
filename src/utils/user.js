export const getCurrentUserName = (fallback = "User") =>
  localStorage.getItem("name") || fallback;
// The logged-in user's id, saved at login. Practice screens send it with every
// answer, so it must never be a hard-coded value. Returns undefined when
// nobody is logged in (the request then fails instead of writing as user 1).
export const getCurrentUserId = () => {
  const id = Number(localStorage.getItem("userId"));

  return Number.isFinite(id) && id > 0 ? id : undefined;
};
