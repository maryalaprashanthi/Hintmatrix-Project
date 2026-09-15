export const getCurrentUserName = (fallback = "User") =>
  localStorage.getItem("name") || fallback;