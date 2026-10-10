export const isGuestUser = (user) =>
  String(user?.roleName ?? user?.role?.roleName ?? "").trim().toUpperCase() === "GUEST";

export const visibleUsers = (users = [], includeGuests = false) =>
  users.filter((user) => includeGuests || !isGuestUser(user));
