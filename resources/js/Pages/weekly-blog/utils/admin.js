export const getAdminToken = () => {
  try {
    return window.localStorage.getItem("admin_token") || "";
  } catch {
    return "";
  }
};

export const isAdminUnlocked = () => {
  const token = getAdminToken();
  return Boolean(token && token.trim().length > 0);
};
